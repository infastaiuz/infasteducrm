import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [searchParams] = useSearchParams();
  const studentFilter = searchParams.get('student_id');

  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    payment_type: 'CASH',
    note: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchPayments();
  }, [studentFilter]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const params = {};
      if (studentFilter) params.student_id = studentFilter;
      
      const response = await api.get('/payments', { params });
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPayment) {
        await api.put(`/payments/${editingPayment._id}`, formData);
      } else {
        await api.post('/payments', formData);
      }
      setShowModal(false);
      setEditingPayment(null);
      resetForm();
      fetchPayments();
      fetchStudents(); // Refresh to update student status
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      student_id: payment.student_id._id || payment.student_id,
      amount: payment.amount,
      payment_date: format(new Date(payment.payment_date), 'yyyy-MM-dd'),
      payment_type: payment.payment_type,
      note: payment.note || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('To\'lovni o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await api.delete(`/payments/${id}`);
      fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: studentFilter || '',
      amount: '',
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      payment_type: 'CASH',
      note: ''
    });
  };

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'CASH': return 'Naqd';
      case 'CARD': return 'Karta';
      case 'CLICK': return 'Click';
      case 'PAYME': return 'Payme';
      default: return type;
    }
  };

  if (loading) {
    return <div className="text-center py-12">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">To'lovlar</h1>
        <button
          onClick={() => {
            setEditingPayment(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Yangi to'lov
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">O'quvchi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Summa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Sana</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">To'lov turi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Izoh</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {payments.map((payment) => (
              <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {payment.student_id?.full_name || 'Noma\'lum'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {payment.student_id?.group_id?.name || ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                  {payment.amount.toLocaleString()} so'm
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {format(new Date(payment.payment_date), 'dd.MM.yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {getPaymentTypeLabel(payment.payment_type)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {payment.note || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(payment)}
                      className="text-orange-600 hover:text-orange-900 dark:text-orange-400"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(payment._id)}
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
                {editingPayment ? 'To\'lovni tahrirlash' : 'Yangi to\'lov'}
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
                  O'quvchi *
                </label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  required
                  disabled={!!studentFilter}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option value="">O'quvchini tanlang</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.full_name} - {student.group_id?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Summa (so'm) *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To'lov sanasi *
                </label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To'lov turi *
                </label>
                <select
                  value={formData.payment_type}
                  onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="CASH">Naqd</option>
                  <option value="CARD">Karta</option>
                  <option value="CLICK">Click</option>
                  <option value="PAYME">Payme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Izoh
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
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
                  {editingPayment ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

