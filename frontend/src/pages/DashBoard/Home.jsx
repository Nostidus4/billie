import DashBoardLayout from '@components/layouts/DashBoardLayout'
import React, { useState, useContext, useEffect } from 'react'
import { useUserAuth } from '@/hooks/useUserAuth'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '@/utils/axiosInstance'
import { API_PATHS } from '@/utils/apiPath'
import { UserContext } from '@context/UserContext'

import {LuHandCoins, LuWalletMinimal} from 'react-icons/lu'
import {IoMdCard} from 'react-icons/io'
import { addThousandSeparator } from '@/utils/helper'
import InfoCard from '@components/cards/InfoCard'
import RecentTransactions from '@components/dashboard/RecentTransactions'
import FinanceOverview from '@components/dashboard/FinanceOverview'
import ExpenseTransaction from '@components/dashboard/ExpenseTransaction'
import Last30DaysExpenses from '@components/dashboard/Last30DaysExpenses'
import RecentIncomes from '@components/dashboard/RecentIncomes'
const Home = () => {
  useUserAuth();
  const { user } = useContext(UserContext);

  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fetchDashboardData = async () => {
    if (loading) return;
    setLoading(true);

    try {
      console.log("Current user:", user);
      const response = await axiosInstance.get(`${API_PATHS.DASHBOARD.GET_DATA}`);
      console.log("Dashboard response:", response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <DashBoardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <InfoCard 
            icon={<IoMdCard />}
            label="Total Balance"
            value={addThousandSeparator(dashboardData?.totalBalance || 0)}
            color="bg-green-600"
          />

          <InfoCard 
            icon={< LuWalletMinimal />}
            label="Total Income"
            value={addThousandSeparator(dashboardData?.totalIncome || 0)}
            color="bg-orange-500"
          />

          <InfoCard 
            icon={<LuHandCoins />}
            label="Total Expense"
            value={addThousandSeparator(dashboardData?.totalExpenses || 0)}
            color="bg-red-500"
          />
        </div>
      </div>

      <div className='mt-6 space-y-8'>
        <RecentTransactions 
          transactions = {dashboardData?.recentTransactions || []}
          onSeeMore = {() => navigate("/expense")}
        />

        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 items-stretch auto-rows-fr [&>div]:h-full [&_.card]:h-full [&_.card]:min-h-[420px]'>
          <div className='w-full'>
            <FinanceOverview 
              totalBalance = {dashboardData?.totalBalance || 0}
              totalIncome = {dashboardData?.totalIncome || 0}
              totalExpenses = {dashboardData?.totalExpenses || 0}
            />
          </div>

          <div className='w-full'>
            <ExpenseTransaction 
              transactions = {dashboardData?.last30DaysEnpenses?.transactions || []}
              onSeeMore = {() => navigate("/expense")}
            />
          </div>

          <div className='w-full'>
            <Last30DaysExpenses 
              transactions = {dashboardData?.last30DaysEnpenses?.transactions || []}
            />
          </div>

          <div className='w-full'>
            <RecentIncomes
              transactions = {dashboardData?.last60DaysIncome?.transactions || []}
              totalIncome = {dashboardData?.totalIncome || 0}
              onSeeMore = {() => navigate("/income")}
            />
          </div>
        </div>
      </div>
    </DashBoardLayout>
  )
}

export default Home