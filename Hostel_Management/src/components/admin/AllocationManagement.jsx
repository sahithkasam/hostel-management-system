import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit, UserCheck, Calendar, DollarSign } from 'lucide-react';

const AllocationManagement = () => {
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    roomId: '',
    startDate: '',
    monthlyRent: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const [allocationsRes, studentsRes, roomsRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/allocations?${statusFilter ? `status=${statusFilter}` : ''}&limit=100`),
        axios.get('http://localhost:5001/api/users?role=student&limit=1000'),
        axios.get('http://localhost:5001/api/rooms?available=true&limit=1000')
      ]);

      setAllocations(allocationsRes.data.allocations);
      setStudents(studentsRes.data.users.filter(user => !user.roomAllocation));
      setRooms(roomsRes.data.rooms.filter(room => room.currentOccupancy < room.capacity));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/allocations', formData);
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error creating allocation:', error);
      alert(error.response?.data?.message || 'Error creating allocation');
    }
  };

  const handleStatusUpdate = async (allocationId, newStatus) => {
    try {
      await axios.put(`http://localhost:5001/api/allocations/${allocationId}`, {
        status: newStatus,
        endDate: newStatus === 'vacated' ? new Date().toISOString() : undefined
      });
      fetchData();
    } catch (error) {
      console.error('Error updating allocation:', error);
      alert('Error updating allocation status');
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      roomId: '',
      startDate: '',
      monthlyRent: '',
      notes: ''
    });
    setShowAddModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Room Allocations</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Allocation
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="vacated">Vacated</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : allocations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No allocations found
                  </td>
                </tr>
              ) : (
                allocations.map((allocation) => (
                  <tr key={allocation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {allocation.student?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {allocation.student?.studentId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          Room {allocation.room?.roomNumber}
                        </div>
                        <div className="ml-2 text-sm text-gray-500">
                          Floor {allocation.room?.floor}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <div>
                          <div>Start: {formatDate(allocation.startDate)}</div>
                          {allocation.endDate && (
                            <div>End: {formatDate(allocation.endDate)}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-green-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ₹{allocation.monthlyRent}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        allocation.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : allocation.status === 'vacated'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {allocation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {allocation.status === 'active' && (
                        <button
                          onClick={() => handleStatusUpdate(allocation._id, 'vacated')}
                          className="text-red-600 hover:text-red-900 mr-4"
                        >
                          Vacate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Allocation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={resetForm}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Create New Allocation
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student
                      </label>
                      <select
                        required
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a student</option>
                        {students.map((student) => (
                          <option key={student._id} value={student._id}>
                            {student.name} ({student.studentId})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room
                      </label>
                      <select
                        required
                        value={formData.roomId}
                        onChange={(e) => {
                          const room = rooms.find(r => r._id === e.target.value);
                          setFormData({ 
                            ...formData, 
                            roomId: e.target.value,
                            monthlyRent: room?.monthlyRent?.toString() || ''
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a room</option>
                        {rooms.map((room) => (
                          <option key={room._id} value={room._id}>
                            Room {room.roomNumber} - Floor {room.floor} 
                            ({room.currentOccupancy}/{room.capacity}) - ₹{room.monthlyRent}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Rent (₹)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.monthlyRent}
                        onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any additional notes..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Allocate Room
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocationManagement;