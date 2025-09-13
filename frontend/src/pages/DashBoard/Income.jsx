import AddIncomeForm from '@components/income/AddIncomeForm';
import IncomeList from '@components/income/IncomeList';
import IncomeOverview from '@components/income/IncomeOverview';
import DashBoardLayout from '@components/layouts/DashBoardLayout'
import DeleteAlert from '@components/layouts/DeleteAlert';
import Modal from '@components/Modal';
import { useUserAuth } from '@hooks/useUserAuth';
import { API_PATHS } from '@utils/apiPath';
import { axiosInstance } from '@utils/axiosInstance';
import React, { useEffect, useState } from 'react'

const Income = () => {
  useUserAuth();
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null
  });
  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);

  const fetchIncomeDetails = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Fetch income details logic here
      const response = await axiosInstance.get(`${API_PATHS.INCOME.GET_ALL_INCOME}`);
      if(response.data) { 
        setIncomeData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };


  const handleAddIncome = async (payload) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.post(`${API_PATHS.INCOME.ADD_INCOME}`, payload);
      if (response.data) {
        setOpenAddIncomeModal(false);
        fetchIncomeDetails(); // Refresh data
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadIncomeDetails = async () => {};
  useEffect(() => {
    fetchIncomeDetails();
    return () => {
    };
  }, []);

  const handleDeleteIncome = async (id) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
      if (response.data) {
        setOpenDeleteAlert({show: false, data: null});
        fetchIncomeDetails(); // Refresh data
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashBoardLayout activeMenu="Income">
      <div className="my-5 mx-auto">
        <div className='grid grid-cols-1 gap-6'>
          <div>
            <IncomeOverview 
              transactions = {incomeData}
              onAddIncome = {() => setOpenAddIncomeModal(true)}
            />
          </div>

          <IncomeList 
            transactions = {incomeData}
            onDelete = {(id) => {
              setOpenDeleteAlert({show: true, data: id});
            }}
            onDownload = {handleDownloadIncomeDetails}
          />
        </div>

        <Modal 
          isOpen={openAddIncomeModal}
          onClose={() => setOpenAddIncomeModal(false)}
          title="Add New Income">
          <AddIncomeForm onAddIncome={handleAddIncome} />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({show: false, data: null})}
          title="Delete Income">
            <DeleteAlert 
              content = "Are you sure you want to delete this income?"
              onDelete = {() => handleDeleteIncome(openDeleteAlert.data)}
            />
        </Modal>
      </div>
    </DashBoardLayout>
  )
}

export default Income