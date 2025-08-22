import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Building, UserCheck, DollarSign, Plus, Search, Filter } from 'lucide-react';
import UserManagement from './UserManagement';
import RoomManagement from './RoomManagement';
import AllocationManagement from './AllocationManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    totalAllocations: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, roomsRes, allocationsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/users?role=student&limit=1000'),
        axios.get('http://localhost:5001/api/rooms?limit=1000'),
        axios.get('http://localhost:5001/api/allocations?status=active&limit=1000')
      ]);

      const totalRevenue = allocationsRes.data.allocations.reduce(
        (sum, allocation) => sum + allocation.monthlyRent, 0
      );

      setStats({
        totalStudents: usersRes.data.total,
        totalRooms: roomsRes.data.total,
        totalAllocations: allocationsRes.data.total,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>
            {loading ? '...' : value}
          </p>
          {subtext && (
            <p className="text-sm text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', component: null },
    { id: 'users', label: 'User Management', component: <UserManagement /> },
    { id: 'rooms', label: 'Room Management', component: <RoomManagement /> },
    { id: 'allocations', label: 'Allocations', component: <AllocationManagement /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your hostel operations efficiently
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon={Users}
              color="text-blue-600"
              subtext="Registered students"
            />
            <StatCard
              title="Total Rooms"
              value={stats.totalRooms}
              icon={Building}
              color="text-green-600"
              subtext="Available rooms"
            />
            <StatCard
              title="Active Allocations"
              value={stats.totalAllocations}
              icon={UserCheck}
              color="text-purple-600"
              subtext="Current assignments"
            />
            <StatCard
              title="Monthly Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="text-orange-600"
              subtext="From allocations"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('users')}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <span className="font-medium text-gray-900">Add New Student</span>
              </button>
              
              <button
                onClick={() => setActiveTab('rooms')}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="bg-green-100 p-2 rounded-lg">
                  <Building className="h-5 w-5 text-green-600" />
                </div>
                <span className="font-medium text-gray-900">Manage Rooms</span>
              </button>
              
              <button
                onClick={() => setActiveTab('allocations')}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="bg-purple-100 p-2 rounded-lg">
                  <UserCheck className="h-5 w-5 text-purple-600" />
                </div>
                <span className="font-medium text-gray-900">Allocate Room</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        tabs.find(tab => tab.id === activeTab)?.component
      )}
    </div>
  );
};

export default AdminDashboard;