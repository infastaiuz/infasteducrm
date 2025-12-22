import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const groupParam = searchParams.get('group_id');
    const dateParam = searchParams.get('date');
    if (groupParam) setSelectedGroup(groupParam);
    if (dateParam) setSelectedDate(dateParam);
    
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchStudents();
      fetchAttendance();
    }
  }, [selectedGroup, selectedDate]);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data.filter(g => g.status === 'ACTIVE'));
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchStudents = async () => {
    if (!selectedGroup) return;
    try {
      const response = await api.get('/students', { params: { group_id: selectedGroup } });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedGroup || !selectedDate) return;
    try {
      const response = await api.get('/attendance', {
        params: { group_id: selectedGroup, date: selectedDate }
      });
      setAttendance(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setLoading(false);
    }
  };

  const handleAttendanceChange = async (studentId, status) => {
    try {
      await api.post('/attendance', {
        student_id: studentId,
        group_id: selectedGroup,
        date: selectedDate,
        status
      });
      fetchAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const getAttendanceStatus = (studentId) => {
    const record = attendance.find(a => a.student_id._id === studentId || a.student_id === studentId);
    return record?.status || 'ABSENT';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle className="text-green-500" size={24} />;
      case 'LATE': return <Clock className="text-yellow-500" size={24} />;
      case 'ABSENT': return <XCircle className="text-red-500" size={24} />;
      default: return <XCircle className="text-gray-400" size={24} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PRESENT': return 'Qatnashdi';
      case 'LATE': return 'Kechikdi';
      case 'ABSENT': return 'Qatnashmadi';
      default: return 'Qatnashmadi';
    }
  };

  if (loading && selectedGroup) {
    return <div className="text-center py-12">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Davomat</h1>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Guruh *
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setLoading(true);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Guruhni tanlang</option>
              {groups.map(group => (
                <option key={group._id} value={group._id}>{group.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sana *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setLoading(true);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      {selectedGroup && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {groups.find(g => g._id === selectedGroup)?.name} - {format(new Date(selectedDate), 'dd.MM.yyyy')}
            </h2>
          </div>

          {students.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Bu guruhda o'quvchilar yo'q
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student) => {
                const currentStatus = getAttendanceStatus(student._id);
                return (
                  <div
                    key={student._id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.full_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {student.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(currentStatus)}
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {getStatusLabel(currentStatus)}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAttendanceChange(student._id, 'PRESENT')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentStatus === 'PRESENT'
                                ? 'bg-green-500 text-white'
                                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                            }`}
                          >
                            Qatnashdi
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(student._id, 'LATE')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentStatus === 'LATE'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                            }`}
                          >
                            Kechikdi
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(student._id, 'ABSENT')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentStatus === 'ABSENT'
                                ? 'bg-red-500 text-white'
                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                            }`}
                          >
                            Qatnashmadi
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!selectedGroup && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">
            Davomatni belgilash uchun guruhni tanlang
          </p>
        </div>
      )}
    </div>
  );
}

