import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Plus, Edit, Trash2, X, Play, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [activatingGroup, setActivatingGroup] = useState(null);
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');

  const [formData, setFormData] = useState({
    course_id: '',
    name: '',
    status: 'NABOR',
    start_date: '',
    days_of_week: [],
    time: '',
    min_students: 3,
    max_students: 15
  });

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayLabels = {
    Mon: 'Dushanba',
    Tue: 'Seshanba',
    Wed: 'Chorshanba',
    Thu: 'Payshanba',
    Fri: 'Juma',
    Sat: 'Shanba',
    Sun: 'Yakshanba'
  };

  useEffect(() => {
    fetchCourses();
    fetchGroups();
  }, [statusFilter]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.filter(c => c.is_active));
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      let filtered = response.data;
      if (statusFilter) {
        filtered = filtered.filter(g => g.status === statusFilter);
      }
      setGroups(filtered);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await api.put(`/groups/${editingGroup._id}`, formData);
      } else {
        await api.post('/groups', formData);
      }
      setShowModal(false);
      setEditingGroup(null);
      resetForm();
      fetchGroups();
    } catch (error) {
      console.error('Error saving group:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleActivate = async () => {
    try {
      await api.post(`/groups/${activatingGroup._id}/activate`, {
        start_date: formData.start_date
      });
      setShowActivateModal(false);
      setActivatingGroup(null);
      resetForm();
      fetchGroups();
      alert('Guruh muvaffaqiyatli faollashtirildi!');
    } catch (error) {
      console.error('Error activating group:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      course_id: group.course_id._id || group.course_id,
      name: group.name,
      status: group.status,
      start_date: group.start_date ? format(new Date(group.start_date), 'yyyy-MM-dd') : '',
      days_of_week: group.days_of_week || [],
      time: group.time || '',
      min_students: group.min_students || 3,
      max_students: group.max_students || 15
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Guruhni o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await api.delete(`/groups/${id}`);
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const resetForm = () => {
    setFormData({
      course_id: '',
      name: '',
      status: 'NABOR',
      start_date: '',
      days_of_week: [],
      time: '',
      min_students: 3,
      max_students: 15
    });
  };

  const toggleDay = (day) => {
    setFormData({
      ...formData,
      days_of_week: formData.days_of_week.includes(day)
        ? formData.days_of_week.filter(d => d !== day)
        : [...formData.days_of_week, day]
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'NABOR': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Faol';
      case 'NABOR': return 'Nabor';
      case 'CLOSED': return 'Yopilgan';
      default: return status;
    }
  };

  if (loading) {
    return <div className="text-center py-12">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Guruhlar</h1>
        <button
          onClick={() => {
            setEditingGroup(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Yangi guruh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nomi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Kurs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Holati</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Vaqt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Kunlar</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {groups.map((group) => (
              <tr key={group._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{group.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {group.course_id?.name || 'Noma\'lum'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(group.status)}`}>
                    {getStatusLabel(group.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {group.time || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {group.days_of_week.map(d => dayLabels[d]).join(', ') || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {group.status === 'NABOR' && (
                      <button
                        onClick={() => {
                          setActivatingGroup(group);
                          setFormData({ ...formData, start_date: '' });
                          setShowActivateModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 dark:text-green-400"
                        title="Faollashtirish"
                      >
                        <Play size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(group)}
                      className="text-orange-600 hover:text-orange-900 dark:text-orange-400"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(group._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingGroup ? 'Guruhni tahrirlash' : 'Yangi guruh'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kurs *
                </label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Kursni tanlang</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Guruh nomi *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dars vaqti (masalan: 14:00-16:00)
                </label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="14:00-16:00"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dars kunlari
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {days.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        formData.days_of_week.includes(day)
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {dayLabels[day]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min o'quvchilar
                  </label>
                  <input
                    type="number"
                    value={formData.min_students}
                    onChange={(e) => setFormData({ ...formData, min_students: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max o'quvchilar
                  </label>
                  <input
                    type="number"
                    value={formData.max_students}
                    onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  {editingGroup ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activate Modal */}
      {showActivateModal && activatingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Guruhni faollashtirish
              </h2>
              <button
                onClick={() => setShowActivateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              <strong>{activatingGroup.name}</strong> guruhini faollashtirishni tasdiqlaysizmi?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Boshlanish sanasi *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowActivateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleActivate}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Faollashtirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

