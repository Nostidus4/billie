import AddGoalForm from '@components/prediction/AddGoalForm';
import PredictionOverview from '@components/prediction/PredictionOverview';
import GoalList from '@components/prediction/GoalList';
import DashBoardLayout from '@components/layouts/DashBoardLayout'
import DeleteAlert from '@components/layouts/DeleteAlert'
import Modal from '@components/Modal';
import { useUserAuth } from '@hooks/useUserAuth';
import { axiosInstance } from '@utils/axiosInstance';
import React, { useEffect, useState } from 'react'

const Prediction = () => {
  useUserAuth();
  const [predictionData, setPredictionData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null
  });
  const [openAddGoalModal, setOpenAddGoalModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    type: 'month',
    value: new Date().toISOString().substring(0, 7) // Current month
  });

  const fetchPredictionData = async (dateFilter = null) => {
    if (loading) return;
    setLoading(true);
    try {
      const params = dateFilter ? { 
        type: dateFilter.type, 
        value: dateFilter.value 
      } : {};
      
      const response = await axiosInstance.get('/api/v1/prediction/prediction', { params });
      setPredictionData(response.data);
    } catch (error) {
      console.error('Error fetching prediction data:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Insufficient data')) {
        // Handle insufficient data case - still show historical data if available
        setPredictionData({
          prediction: null,
          chartData: error.response.data.chartData || [],
          historicalData: error.response.data.historicalData || [],
          insufficientData: true
        });
      } else {
        console.log("Something went wrong. Please try again.", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/v1/prediction/goals');
      setGoals(response.data);
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (goal) => {
    if (loading) return;
    const { title, amount, deadline } = goal;

    if (!title || !title.trim()) {
      console.error('Title is required.');
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      console.error('Amount should be a valid number greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/api/v1/goal/add', {
        title: title.trim(),
        amount: Number(amount),
        deadline: deadline || undefined,
      });
      setOpenAddGoalModal(false);
      fetchGoals();
    } catch (error) {
      console.log('Something went wrong. Please try again.', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axiosInstance.delete(`/api/v1/goal/${id}`);
      if (response.data) {
        setOpenDeleteAlert({ show: false, data: null });
        fetchGoals();
      }
    } catch (error) {
      console.log('Something went wrong. Please try again.', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadGoals = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/goal/downloadexcel', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'goals.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.log('Something went wrong. Please try again.', error);
    }
  };

  const handleDateRangeChange = (type, value) => {
    const newDateRange = { ...dateRange, [type]: value };
    setDateRange(newDateRange);
    fetchPredictionData(newDateRange);
  };

  useEffect(() => {
    fetchPredictionData();
    fetchGoals();
    return () => {
    };
  }, []);

  return (
    <DashBoardLayout activeMenu="Prediction">
      <div className='my-5 mx-auto'>
        <div className='grid grid-cols-1 gap-6'>
          <PredictionOverview 
            predictionData={predictionData} 
            onAddGoal={() => {
              setOpenAddGoalModal(true);
            }}
            onDateRangeChange={handleDateRangeChange}
            dateRange={dateRange}
            loading={loading}
          />
          <GoalList 
            goals={goals}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
            onDownload={handleDownloadGoals}
          />
        </div>

        <Modal isOpen={openAddGoalModal} onClose={() => setOpenAddGoalModal(false)} title="Add New Goal">
          <AddGoalForm onAddGoal={handleAddGoal} loading={loading} />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Goal"
        >
          <DeleteAlert
            content="Are you sure you want to delete this goal?"
            onDelete={() => handleDeleteGoal(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashBoardLayout>
  )
}

export default Prediction