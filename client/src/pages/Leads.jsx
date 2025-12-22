import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash2, X, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [groupFilter, setGroupFilter] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    group_id: '',
    lead_status: 'INTERESTED'
  });

  useEffect(() => {
    fetchGroups();
    fetchLeads();
  }, [groupFilter]);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data.filter(g => g.status === 'NABOR'));
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      const params = groupFilter ? { group_id: groupFilter } : {};
      const response = await api.get('/leads', { params });
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLead) {
        await api.put(`/leads/${editingLead._id}`, formData);
      } else {
        await api.post('/leads', formData);
      }
      setShowModal(false);
      setEditingLead(null);
      resetForm();
      fetchLeads();
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const handleConvert = async (leadId) => {
    if (!confirm('Nabor o\'quvchini o\'quvchiga aylantirishni tasdiqlaysizmi?')) return;
    try {
      await api.post(`/leads/${leadId}/convert`);
      fetchLeads();
      alert('Muvaffaqiyatli aylantirildi!');
    } catch (error) {
      console.error('Error converting lead:', error);
      alert(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      phone: lead.phone,
      group_id: lead.group_id._id || lead.group_id,
      lead_status: lead.lead_status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Nabor o\'quvchini o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await api.delete(`/leads/${id}`);
      fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      group_id: '',
      lead_status: 'INTERESTED'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'REGISTERED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'INTERESTED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'Tasdiqlangan';
      case 'REGISTERED': return 'Ro\'yxatdan o\'tgan';
      case 'INTERESTED': return 'Qiziqish bildirgan';
      default: return status;
    }
  };

  if (loading) {
    return <div className="text-center py-12">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nabor o'quvchilar</h1>
        <div className="flex gap-3">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Barcha guruhlar</option>
            {groups.map(group => (
              <option key={group._id} value={group._id}>{group.name}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditingLead(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Yangi nabor
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ism</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Telefon</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Guruh</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Holati</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Sana</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{lead.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {lead.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {lead.group_id?.name || 'Noma\'lum'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.lead_status)}`}>
                    {getStatusLabel(lead.lead_status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {format(new Date(lead.createdAt), 'dd.MM.yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleConvert(lead._id)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400"
                      title="O'quvchiga aylantirish"
                    >
                      <UserCheck size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(lead)}
                      className="text-orange-600 hover:text-orange-900 dark:text-orange-400"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(lead._id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingLead ? 'Nabor o\'quvchini tahrirlash' : 'Yangi nabor o\'quvchi'}
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
                  Ism *
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
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Guruh (Nabor) *
                </label>
                <select
                  value={formData.group_id}
                  onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                  required
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
                  Holati
                </label>
                <select
                  value={formData.lead_status}
                  onChange={(e) => setFormData({ ...formData, lead_status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="INTERESTED">Qiziqish bildirgan</option>
                  <option value="REGISTERED">Ro'yxatdan o'tgan</option>
                  <option value="CONFIRMED">Tasdiqlangan</option>
                </select>
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
                  {editingLead ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

