import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Users, 
  Calendar, 
  AlertCircle, 
  DollarSign, 
  UserCheck,
  UserPlus,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboard();
  }, [user, navigate]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Yuklanmoqda...</div>;
  }

  if (!data) {
    return <div className="text-center py-12">Ma'lumotlar topilmadi</div>;
  }

  const stats = [
    {
      title: 'Faol guruhlar',
      value: data.activeGroupsCount,
      icon: Users,
      color: 'bg-green-500',
      link: '/groups?status=ACTIVE'
    },
    {
      title: 'Nabor guruhlar',
      value: data.naborGroupsCount,
      icon: UserPlus,
      color: 'bg-yellow-500',
      link: '/groups?status=NABOR'
    },
    {
      title: 'Faol o\'quvchilar',
      value: data.activeStudentsCount,
      icon: UserCheck,
      color: 'bg-blue-500',
      link: '/students?status=ACTIVE'
    },
    {
      title: 'Oylik tushum',
      value: `${data.monthlyRevenue.toLocaleString()} so'm`,
      icon: DollarSign,
      color: 'bg-orange-500',
      link: '/payments'
    },
    {
      title: 'Bugungi darslar',
      value: data.todaysGroups,
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/attendance'
    },
    {
      title: 'To\'lov kutilmoqda',
      value: data.paymentsDueToday,
      icon: Clock,
      color: 'bg-indigo-500',
      link: '/payments'
    },
    {
      title: 'Qarzdorlar',
      value: data.debtorsCount,
      icon: AlertCircle,
      color: 'bg-red-500',
      link: '/students?status=DEBTOR'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {format(new Date(), 'd MMMM yyyy, EEEE')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Today's Payments Due */}
      {data.paymentsDueTodayList && data.paymentsDueTodayList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Bugun to'lov qiladiganlar
          </h2>
          <div className="space-y-2">
            {data.paymentsDueTodayList.map((student) => (
              <div
                key={student._id}
                className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {student.full_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {student.group_id?.name} • {student.phone}
                  </p>
                </div>
                <Link
                  to={`/payments?student_id=${student._id}`}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                >
                  To'lov qo'shish
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debtors */}
      {data.debtorsList && data.debtorsList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Qarzdorlar
          </h2>
          <div className="space-y-2">
            {data.debtorsList.slice(0, 5).map((student) => (
              <div
                key={student._id}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {student.full_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {student.group_id?.name} • {student.phone}
                  </p>
                  {student.next_payment_date && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      To'lov sanasi: {format(new Date(student.next_payment_date), 'dd.MM.yyyy')}
                    </p>
                  )}
                </div>
                <Link
                  to={`/payments?student_id=${student._id}`}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  To'lov qo'shish
                </Link>
              </div>
            ))}
          </div>
          {data.debtorsList.length > 5 && (
            <Link
              to="/students?status=DEBTOR"
              className="block text-center mt-4 text-orange-500 hover:text-orange-600"
            >
              Barcha qarzdorlarni ko'rish ({data.debtorsList.length})
            </Link>
          )}
        </div>
      )}

      {/* Today's Groups */}
      {data.todaysGroupsList && data.todaysGroupsList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Bugungi darslar
          </h2>
          <div className="space-y-2">
            {data.todaysGroupsList.map((group) => (
              <Link
                key={group._id}
                to={`/attendance?group_id=${group._id}&date=${format(new Date(), 'yyyy-MM-dd')}`}
                className="block p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  {group.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {group.course_id?.name} • {group.time}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

