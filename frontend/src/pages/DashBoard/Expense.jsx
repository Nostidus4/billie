import AddExpenseForm from '@components/expense/AddExpenseForm';
import ExpenseOverview from '@components/expense/ExpenseOverview';
import ExpenseList from '@components/expense/ExpenseList';
import DashBoardLayout from '@components/layouts/DashBoardLayout'
import DeleteAlert from '@components/layouts/DeleteAlert'
import Modal from '@components/Modal';
import { useUserAuth } from '@hooks/useUserAuth';
import { API_PATHS } from '@utils/apiPath';
import { axiosInstance } from '@utils/axiosInstance';
import React, { useEffect, useState } from 'react'

const Expense = () => {
  useUserAuth();
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null
  });
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);

  const fetchExpenseDetails = async () => {
      if (loading) return;
      setLoading(true);
      try {
        // Fetch income details logic here
        const response = await axiosInstance.get(`${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`);
        if(response.data) { 
          setExpenseData(response.data);
        }
      } catch (error) {
        console.log("Something went wrong. Please try again.", error);
      } finally {
        setLoading(false);
      }
    };
  
  
    const handleAddExpense = async (expense) => {
      if (loading) return;
      const { category, amount, description, date, icon } = expense;

      if (!category || !category.trim()) {
        console.error('Category is required.');
        return;
      }
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        console.error('Amount should be a valid number greater than 0.');
        return;
      }
      if (!date) {
        console.error('Date is required.');
        return;
      }

      setLoading(true);
      try {
        await axiosInstance.post(`${API_PATHS.EXPENSE.ADD_EXPENSE}`, {
          category: category.trim(),
          amount: Number(amount),
          date,
          description: description || '',
          icon: icon || null,
        });
        setOpenAddExpenseModal(false);
        fetchExpenseDetails();
      } catch (error) {
        console.log('Something went wrong. Please try again.', error);
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteExpense = async (id) => {
      if (loading) return;

      setLoading(true);
      try {
        const response = await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
        if (response.data) {
          setOpenDeleteAlert({ show: false, data: null });
          fetchExpenseDetails();
        }
      } catch (error) {
        console.log('Something went wrong. Please try again.', error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() =>{
      fetchExpenseDetails();
      return () => {
      };
    }, []);
  return (
    <DashBoardLayout activeMenu="Expense">
      <div className='my-5 mx-auto'>
        <div className='grid grid-cols-1 gap-6'>
          <ExpenseOverview transactions={expenseData} onExpenseIcome={() => {
            setOpenAddExpenseModal(true);
          }}/>
          <ExpenseList 
            transactions={expenseData}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
            onDownload={() => {}}
          />
        </div>

        <Modal isOpen={openAddExpenseModal} onClose={() => setOpenAddExpenseModal(false)} title="Add New Expense">
          <AddExpenseForm onAddExpense={handleAddExpense} />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Expense"
        >
          <DeleteAlert
            content="Are you sure you want to delete this expense?"
            onDelete={() => handleDeleteExpense(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashBoardLayout>
  )
}

export default Expense
