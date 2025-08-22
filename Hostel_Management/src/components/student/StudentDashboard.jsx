import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Building, Users, Calendar, DollarSign, Phone, Mail, MapPin, Wifi, AirVent, Bed } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [showRooms, setShowRooms] = useState(false);

  useEffect(() => {
    fetchAllocation();
    fetchAvailableRooms();
  }, []);

  const fetchAllocation = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/allocations/my-allocation');
      setAllocation(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching allocation:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/rooms?available=true&limit=50');
      setAvailableRooms(response.data.rooms);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
    }
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'AC': return <AirVent className="h-4 w-4" />;
      case 'WiFi': return <Wifi className="h-4 w-4" />;
      default: return <Bed className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-blue-100">
          Student ID: {user?.studentId}
        </p>
      </div>

      {allocation ? (
        <>
          {/* Room Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Room</h2>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Room {allocation.room?.roomNumber}
                    </h3>
                    <p className="text-gray-600">Floor {allocation.room?.floor}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Occupancy</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {allocation.room?.currentOccupancy}/{allocation.room?.capacity}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-600">Monthly Rent</span>
                    </div>
                    <p className="text-lg font-semibold text-green-600">
                      ₹{allocation.monthlyRent}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Allocated Date</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(allocation.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {allocation.room?.amenities && allocation.room.amenities.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Room Amenities</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {allocation.room.amenities.map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center space-x-2 bg-blue-50 rounded-lg p-3"
                        >
                          {getAmenityIcon(amenity)}
                          <span className="text-sm font-medium text-blue-800">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {allocation.notes && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-600 bg-gray-50 rounded-lg p-4">
                      {allocation.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Roommates */}
          {allocation.room?.residents && allocation.room.residents.length > 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Roommates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allocation.room.residents
                  .filter(resident => resident._id !== user.id)
                  .map((roommate) => (
                  <div key={roommate._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{roommate.name}</h3>
                        <p className="text-sm text-gray-600">ID: {roommate.studentId}</p>
                        {roommate.email && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{roommate.email}</span>
                          </div>
                        )}
                        {roommate.phone && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{roommate.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* No Room Allocated */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Building className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Room Allocated</h2>
            <p className="text-gray-600 mb-6">
              You don't have a room assigned yet. Please contact the admin for room allocation.
            </p>
            <button
              onClick={() => setShowRooms(!showRooms)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {showRooms ? 'Hide Available Rooms' : 'View Available Rooms'}
            </button>
          </div>

          {/* Available Rooms */}
          {showRooms && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rooms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableRooms.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    No available rooms at the moment
                  </div>
                ) : (
                  availableRooms.map((room) => (
                    <div key={room._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Room {room.roomNumber}
                        </h3>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Available
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Floor:</span>
                          <span className="font-medium">{room.floor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-medium capitalize">{room.roomType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Occupancy:</span>
                          <span className="font-medium">
                            {room.currentOccupancy}/{room.capacity}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rent:</span>
                          <span className="font-medium text-green-600">
                            ₹{room.monthlyRent}/month
                          </span>
                        </div>
                      </div>

                      {room.amenities && room.amenities.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.slice(0, 3).map((amenity) => (
                              <span
                                key={amenity}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                              >
                                {getAmenityIcon(amenity)}
                                <span className="ml-1">{amenity}</span>
                              </span>
                            ))}
                            {room.amenities.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                +{room.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {availableRooms.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> To request a room allocation, please contact the hostel administrator. 
                    Room assignments are subject to availability and approval.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              <p className="text-lg text-gray-900">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Student ID</label>
              <p className="text-lg text-gray-900">{user?.studentId}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <p className="text-lg text-gray-900">{user?.email}</p>
              </div>
            </div>
            {user?.phone && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="text-lg text-gray-900">{user.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {user?.address && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-1" />
              <p className="text-lg text-gray-900">{user.address}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;