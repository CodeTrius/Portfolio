import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSupabase } from '../../context/SupabaseContext';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Loading from '../../components/common/Loading';

const AdminStatsPage = () => {
  const { client } = useSupabase();
  const { profile, loadingAuth } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [mostViewed, setMostViewed] = useState([]);
  const [seriesCounts, setSeriesCounts] = useState([]);
  const [dailyViews, setDailyViews] = useState([]);
  const [monthlyPosts, setMonthlyPosts] = useState([]);

  useEffect(() => {
    if (!client) return;
    
    const fetchAllStats = async () => {
      setLoading(true);
      const [mostViewedData, seriesCountsData, dailyViewsData, monthlyPostsData] = await Promise.all([
        client.rpc('get_most_viewed_posts', { limit_count: 5 }),
        client.rpc('get_series_post_counts'),
        client.rpc('get_daily_view_counts', { days_limit: 30 }),
        client.rpc('get_monthly_post_counts')
      ]);

      setMostViewed(mostViewedData.data || []);
      setSeriesCounts(seriesCountsData.data || []);
      
      const formattedDailyViews = dailyViewsData.data?.map(d => ({ ...d, view_day: new Date(d.view_day).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) })) || [];
      setDailyViews(formattedDailyViews.reverse());
      
      const formattedMonthlyPosts = monthlyPostsData.data?.map(d => ({ ...d, post_month: new Date(d.post_month).toLocaleString('pt-BR', { month: 'short', year: 'numeric' }) })) || [];
      setMonthlyPosts(formattedMonthlyPosts);
      
      setLoading(false);
    };
    
    fetchAllStats();
  }, [client]);
  
  if (loadingAuth || loading) {
    return <Loading />;
  }

  if (profile?.role !== 'admin') {
      return <Navigate to="/admin" replace />;
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center', borderBottom: 'none' }}>Painel de Estatísticas</h2>
      <div className="stats-grid">
        <div className="chart-container">
          <h3>Top 5 Posts Mais Lidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mostViewed} layout="vertical" margin={{ top: 5, right: 20, left: 150, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="title" width={150} tick={{ fontSize: 12, fill: 'var(--text-color)' }} />
              <Tooltip cursor={{ fill: 'rgba(0, 245, 160, 0.1)' }} contentStyle={{backgroundColor: 'var(--primary-color)', border: '1px solid var(--border-color)'}}/>
              <Legend />
              <Bar dataKey="view_count" name="Visualizações" fill="var(--accent-color)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Visualizações nos Últimos 30 Dias</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyViews} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="view_day" tick={{fill: 'var(--text-color)'}}/>
              <YAxis allowDecimals={false} tick={{fill: 'var(--text-color)'}}/>
              <Tooltip contentStyle={{backgroundColor: 'var(--primary-color)', border: '1px solid var(--border-color)'}}/>
              <Legend />
              <Line type="monotone" dataKey="view_count" name="Visualizações" stroke="var(--accent-color)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container">
          <h4>Posts por Série</h4>
          {seriesCounts.length > 0 ? seriesCounts.map(item => <p key={item.series_id}>{item.title}: <strong>{item.post_count}</strong></p>) : <p>Nenhum dado.</p>}
        </div>

        <div className="chart-container">
          <h4>Posts Criados por Mês</h4>
          {monthlyPosts.length > 0 ? monthlyPosts.map(item => <p key={item.post_month}>{item.post_month}: <strong>{item.post_count}</strong></p>) : <p>Nenhum dado.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminStatsPage;