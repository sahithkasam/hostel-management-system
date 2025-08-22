import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit, Building, Users, DollarSign, Wifi, AirVent, Bed } from 'lucide-react';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '',
    capacity: '',
    roomType: 'single',
    amenities: [],
    monthlyRent: '',
    isActive: true
  });

  const amenityOptions = ['AC', 'WiFi', 'Attached Bathroom', 'Study Table', 'Wardrobe', 'Fan'];

  useEffect(() => {
    fetchRooms();
  }, [searchTerm, typeFilter, floorFilter]);

  const fetchRooms = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('roomType', typeFilter);
      if (floorFilter) params.append('floor', floorFilter);
      params.append('limit', '100');

      const response = await axios.get(`http://localhost:5001/api/rooms?${params}`);
      let filteredRooms = response.data.rooms;

      if (searchTerm) {
        filteredRooms = filteredRooms.filter(room =>
          room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setRooms(filteredRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const roomData = {
        ...formData,
        floor: parseInt(formData.floor),
        capacity: parseInt(formData.capacity),
        monthlyRent: parseFloat(formData.monthlyRent)
      };

      if (editingRoom) {
        await axios.put(`http://localhost:5001/api/rooms/${editingRoom._id}`, roomData);
      } else {
        await axios.post('http://localhost:5001/api/rooms', roomData);
      }
      
      fetchRooms();
      resetForm();
    } catch (error) {
      console.error('Error saving room:', error);
      alert(error.response?.data?.message || 'Error saving room');
    }
  };

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      floor: '',
      capacity: '',
      roomType: 'single',
      amenities: [],
      monthlyRent: '',
      isActive: true
    });
    setEditingRoom(null);
    setShowAddModal(false);
  };

  const openEditModal = (room) => {
    setFormData({
      roomNumber: room.roomNumber,
      floor: room.floor.toString(),
      capacity: room.capacity.toString(),
      roomType: room.roomType,
      amenities: room.amenities || [],
      monthlyRent: room.monthlyRent.toString(),
      isActive: room.isActive
    });
    setEditingRoom(room);
    setShowAddModal(true);
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'AC': return <AirVent className="h-4 w-4" />;
      case 'WiFi': return <Wifi className="h-4 w-4" />;
      default: return <Bed className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="quad">Quad</option>
          </select>

          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
            <option value="4">Floor 4</option>
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            Loading...
          </div>
        ) : rooms.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No rooms found
          </div>
        ) : (
          rooms.map((room) => (
            <div key={room._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Room {room.roomNumber}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    room.currentOccupancy < room.capacity
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {room.currentOccupancy < room.capacity ? 'Available' : 'Full'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Floor:</span>
                    <span className="font-medium">{room.floor}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{room.roomType}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Occupancy:</span>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {room.currentOccupancy}/{room.capacity}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rent:</span>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        ₹{room.monthlyRent}/month
                      </span>
                    </div>
                  </div>

                  {room.amenities && room.amenities.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600 block mb-2">Amenities:</span>
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {getAmenityIcon(amenity)}
                            <span className="ml-1">{amenity}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    room.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {room.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  <button
                    onClick={() => openEditModal(room)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
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
                    {editingRoom ? 'Edit Room' : 'Add New Room'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Room Number
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.roomNumber}
                          onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Floor
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.floor}
                          onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Room Type
                        </label>
                        <select
                          value={formData.roomType}
                          onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="single">Single</option>
                          <option value="double">Double</option>
                          <option value="triple">Triple</option>
                          <option value="quad">Quad</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Capacity
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="4"
                          value={formData.capacity}
                          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amenities
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {amenityOptions.map((amenity) => (
                          <label key={amenity} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.amenities.includes(amenity)}
                              onChange={() => handleAmenityChange(amenity)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingRoom ? 'Update' : 'Create'}
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

export default RoomManagement;