import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate 
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Search, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon,
  Moon,
  Sun,
  AlertTriangle,
  Lightbulb,
  FileText,
  Trash2,
  Edit2,
  Filter,
  ChevronRight,
  MessageSquare,
  Send,
  Loader2,
  X,
  RotateCcw,
  History
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { api } from './services/api';
import { analyzeInventory, createChatSession } from './services/aiService';
import { MalkhanaItem, User, AIInsights } from './types';
import { cn, formatDate } from './lib/utils';
import { translations, Language } from './translations';

// --- Components ---

const Sidebar = ({ user, activeTab, setActiveTab, onLogout, lang, setLang }: { 
  user: User, 
  activeTab: string, 
  setActiveTab: (tab: string) => void,
  onLogout: () => void,
  lang: Language,
  setLang: (l: Language) => void
}) => {
  const t = translations[lang];
  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'inventory', label: t.inventory, icon: Package },
    { id: 'add', label: t.addItem, icon: PlusCircle },
    { id: 'ai', label: t.aiInsights, icon: Lightbulb },
    { id: 'backlog', label: t.backlog, icon: History },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col p-4 border-r border-slate-800">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-orange-500 p-2 rounded-lg">
          <ShieldCheck size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">{t.appName}</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === item.id 
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
        <div className="flex gap-2 p-1 bg-slate-800 rounded-xl">
          <button 
            onClick={() => setLang('hi')}
            className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold transition-all", lang === 'hi' ? "bg-orange-500 text-white" : "text-slate-500")}
          >
            हिन्दी
          </button>
          <button 
            onClick={() => setLang('en')}
            className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold transition-all", lang === 'en' ? "bg-orange-500 text-white" : "text-slate-500")}
          >
            English
          </button>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl">
          <div className="bg-slate-700 p-2 rounded-full">
            <UserIcon size={16} />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">{t.logout}</span>
        </button>
      </div>
    </div>
  );
};

const Dashboard = ({ items, lang }: { items: MalkhanaItem[], lang: Language }) => {
  const t = translations[lang];
  const stats = [
    { label: t.totalItems, value: items.length, icon: Package, color: 'bg-blue-500' },
    { label: t.deposited, value: items.filter(i => i.status === 'जमा').length, icon: FileText, color: 'bg-orange-500' },
    { label: t.released, value: items.filter(i => i.status === 'रिलीज़').length, icon: ChevronRight, color: 'bg-green-500' },
    { label: t.destroyed, value: items.filter(i => i.status === 'नष्ट').length, icon: Trash2, color: 'bg-red-500' },
  ];

  const chartData = [
    { name: t.deposited, value: items.filter(i => i.status === 'जमा').length },
    { name: t.released, value: items.filter(i => i.status === 'रिलीज़').length },
    { name: t.destroyed, value: items.filter(i => i.status === 'नष्ट').length },
  ];

  const COLORS = ['#f97316', '#22c55e', '#ef4444'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={stat.label} 
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4"
          >
            <div className={cn("p-4 rounded-2xl text-white", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800">{t.statusDistribution}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {chartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-sm text-slate-600 font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800">{t.recentActivities}</h3>
          <div className="space-y-4">
            {items.slice(-5).reverse().map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    <Package size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.itemName}</p>
                    <p className="text-xs text-slate-500">FIR: {item.firNumber}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase px-2 py-1 rounded-full",
                  item.status === 'जमा' ? "bg-orange-100 text-orange-600" :
                  item.status === 'रिलीज़' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                )}>
                  {item.status}
                </span>
              </div>
            ))}
            {items.length === 0 && <p className="text-center text-slate-400 py-10">{t.noData}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const InventoryList = ({ items, onDelete, onEdit, lang }: { 
  items: MalkhanaItem[], 
  onDelete: (id: string) => void,
  onEdit: (item: MalkhanaItem) => void,
  lang: Language
}) => {
  const t = translations[lang];
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(search.toLowerCase()) || 
                         item.firNumber.toLowerCase().includes(search.toLowerCase()) ||
                         item.caseNumber.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={18} className="text-slate-400" />
          <select 
            className="bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">{t.allStatus}</option>
            <option value="जमा">{t.deposited}</option>
            <option value="रिलीज़">{t.released}</option>
            <option value="नष्ट">{t.destroyed}</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-bottom border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.idFir}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.itemName}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.date}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.location}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.officer}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.status}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">{item.id}</p>
                  <p className="text-xs text-slate-500">FIR: {item.firNumber}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-800">{item.itemName}</p>
                  <p className="text-xs text-slate-400 truncate max-w-[150px]">{item.description}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatDate(item.dateReceived)}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-700">Room: {item.location.room}</p>
                  <p className="text-xs text-slate-500">Rack: {item.location.rack}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.officerName}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-3 py-1 rounded-full",
                    item.status === 'जमा' ? "bg-orange-100 text-orange-600" :
                    item.status === 'रिलीज़' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  )}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onEdit(item)}
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="py-20 text-center">
            <Package size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">{t.noItemsFound}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ItemForm = ({ initialItem, onSubmit, onCancel, lang }: { 
  initialItem?: MalkhanaItem, 
  onSubmit: (data: any) => void,
  onCancel: () => void,
  lang: Language
}) => {
  const t = translations[lang];
  const [formData, setFormData] = useState({
    caseNumber: initialItem?.caseNumber || '',
    firNumber: initialItem?.firNumber || '',
    itemName: initialItem?.itemName || '',
    description: initialItem?.description || '',
    dateReceived: initialItem?.dateReceived || new Date().toISOString().split('T')[0],
    officerName: initialItem?.officerName || '',
    location: {
      room: initialItem?.location.room || '',
      rack: initialItem?.location.rack || '',
    },
    status: initialItem?.status || 'जमा'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
          <PlusCircle size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{initialItem ? t.updateItem : t.addItem}</h2>
          <p className="text-slate-500">{t.fillDetails}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t.caseNumber}</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              value={formData.caseNumber}
              onChange={(e) => setFormData({...formData, caseNumber: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t.firNumber}</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              value={formData.firNumber}
              onChange={(e) => setFormData({...formData, firNumber: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">{t.itemName}</label>
          <input 
            required
            type="text" 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            value={formData.itemName}
            onChange={(e) => setFormData({...formData, itemName: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">{t.description}</label>
          <textarea 
            rows={3}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t.date}</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              value={formData.dateReceived}
              onChange={(e) => setFormData({...formData, dateReceived: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t.officer}</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              value={formData.officerName}
              onChange={(e) => setFormData({...formData, officerName: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t.room}</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              value={formData.location.room}
              onChange={(e) => setFormData({...formData, location: {...formData.location, room: e.target.value}})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">{t.rack}</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              value={formData.location.rack}
              onChange={(e) => setFormData({...formData, location: {...formData.location, rack: e.target.value}})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">{t.status}</label>
          <div className="flex gap-4">
            {['जमा', 'रिलीज़', 'नष्ट'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFormData({...formData, status: s as any})}
                className={cn(
                  "flex-1 py-3 rounded-xl font-bold transition-all",
                  formData.status === s 
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                    : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                )}
              >
                {s === 'जमा' ? t.deposited : s === 'रिलीज़' ? t.released : t.destroyed}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
          >
            {t.cancel}
          </button>
          <button 
            type="submit" 
            className="flex-1 py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
          >
            {initialItem ? t.update : t.save}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// Extracted Chat Window Component for reuse
const ChatWindow = ({ items, lang, onClose }: { items: MalkhanaItem[], lang: Language, onClose?: () => void }) => {
  const t = translations[lang];
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (items.length > 0) {
      const session = createChatSession(items, lang);
      setChatSession(session);
      setMessages([{ role: 'model', text: t.chatWelcome }]);
    }
  }, [items, lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || !chatSession || chatLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatLoading(true);

    try {
      const result = await chatSession.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: 'model', text: result.text }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: t.chatError }]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'model', text: t.chatWelcome }]);
    const session = createChatSession(items, lang);
    setChatSession(session);
  };

  const quickQuestions = [t.q1, t.q2, t.q3];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col h-full overflow-hidden"
    >
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-xl">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="font-bold">{t.chatbotTitle}</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">{t.chatbotSubtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title={t.clearChat}
          >
            <RotateCcw size={18} />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={cn(
              "max-w-[85%] p-4 rounded-2xl text-sm font-medium",
              msg.role === 'user' 
                ? "ml-auto bg-orange-500 text-white rounded-tr-none" 
                : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none"
            )}
          >
            {msg.text}
          </div>
        ))}
        {chatLoading && (
          <div className="bg-white text-slate-400 p-4 rounded-2xl rounded-tl-none text-sm font-medium border border-slate-100 w-fit flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            {t.analyzing}
          </div>
        )}
      </div>

      {/* Quick Questions */}
      <div className="px-4 py-2 bg-slate-50 flex gap-2 overflow-x-auto no-scrollbar">
        {quickQuestions.map((q, i) => (
          <button 
            key={i}
            onClick={() => handleSendMessage(q)}
            className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 hover:border-orange-500 hover:text-orange-500 transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
          setInput('');
        }} 
        className="p-4 bg-white border-t border-slate-100 flex gap-2"
      >
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chatbotPlaceholder}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
        />
        <button 
          type="submit"
          disabled={chatLoading || !input.trim()}
          className="bg-orange-500 text-white p-3 rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50 transition-all"
        >
          <Send size={20} />
        </button>
      </form>
    </motion.div>
  );
};

const BacklogView = ({ lang, onRestore }: { lang: Language, onRestore: () => void }) => {
  const t = translations[lang];
  const [backlog, setBacklog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBacklog = async () => {
    setLoading(true);
    try {
      const data = await api.getBacklog();
      setBacklog(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBacklog();
  }, []);

  const handleRestore = async (id: string) => {
    if (window.confirm(t.confirmRestore)) {
      try {
        await api.restoreItem(id);
        fetchBacklog();
        onRestore();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.backlog}</h2>
          <p className="text-slate-500">History of deleted items</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">{t.idFir}</th>
              <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">{t.itemName}</th>
              <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">{t.deletedAt}</th>
              <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">{t.deletedBy}</th>
              <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">{t.status}</th>
              <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">{t.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-4 h-16 bg-slate-50/50"></td>
                </tr>
              ))
            ) : backlog.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic">
                  {t.noData}
                </td>
              </tr>
            ) : (
              backlog.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{item.firNumber}</div>
                    <div className="text-[10px] text-slate-400 font-mono tracking-tighter">{item.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700">{item.itemName}</div>
                    <div className="text-xs text-slate-400 truncate max-w-[200px]">{item.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    {formatDate(item.deletedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {item.deletedBy}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      item.status === 'जमा' ? "bg-orange-100 text-orange-600" :
                      item.status === 'रिलीज़' ? "bg-green-100 text-green-600" :
                      "bg-red-100 text-red-600"
                    )}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleRestore(item.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-[10px] font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                    >
                      <RotateCcw size={14} />
                      {t.restore}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AIInsightsPanel = ({ items, lang }: { items: MalkhanaItem[], lang: Language }) => {
  const t = translations[lang];
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  
  const getInsights = async () => {
    setLoading(true);
    const data = await analyzeInventory(items, lang);
    setInsights(data);
    setLoading(false);
  };

  useEffect(() => {
    if (items.length > 0 && !insights) {
      getInsights();
    }
  }, [items, lang]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.aiInsights}</h2>
          <p className="text-slate-500">{t.aiInsights}</p>
        </div>
        <button 
          onClick={getInsights}
          disabled={loading}
          className="px-6 py-3 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {loading ? t.analyzing : t.refreshInsights}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Insights */}
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map(i => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 animate-pulse h-48"></div>
              ))}
            </div>
          ) : insights ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
                >
                  <div className="flex items-center gap-3 mb-6 text-orange-500">
                    <AlertTriangle size={24} />
                    <h3 className="text-lg font-bold">{t.duplicates}</h3>
                  </div>
                  <ul className="space-y-3">
                    {insights.duplicates.map((d, i) => (
                      <li key={i} className="p-4 bg-orange-50 text-orange-700 rounded-2xl text-sm font-medium border border-orange-100">
                        {d}
                      </li>
                    ))}
                    {insights.duplicates.length === 0 && <p className="text-slate-400">{t.noData}</p>}
                  </ul>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
                >
                  <div className="flex items-center gap-3 mb-6 text-blue-500">
                    <Lightbulb size={24} />
                    <h3 className="text-lg font-bold">{t.suggestions}</h3>
                  </div>
                  <ul className="space-y-3">
                    {insights.suggestions.map((s, i) => (
                      <li key={i} className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-sm font-medium border border-blue-100">
                        {s}
                      </li>
                    ))}
                    {insights.suggestions.length === 0 && <p className="text-slate-400">{t.noData}</p>}
                  </ul>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                  <ShieldCheck className="text-orange-500" />
                  {t.healthSummary}
                </h3>
                <p className="text-slate-300 leading-relaxed text-lg italic">
                  "{insights.summary}"
                </p>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400">विश्लेषण शुरू करने के लिए बटन दबाएं</p>
            </div>
          )}
        </div>

        {/* Chatbot */}
        <div className="lg:col-span-1 h-[650px]">
          <ChatWindow items={items} lang={lang} />
        </div>
      </div>
    </div>
  );
};

const Login = ({ onLogin, lang, setLang }: { onLogin: (user: User) => void, lang: Language, setLang: (l: Language) => void }) => {
  const t = translations[lang];
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.login(username, password);
      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch (err) {
      setError(t.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="absolute top-6 right-6 flex gap-2">
        <button 
          onClick={() => setLang('hi')}
          className={cn("px-4 py-2 rounded-xl font-bold transition-all", lang === 'hi' ? "bg-orange-500 text-white" : "bg-white text-slate-600 border border-slate-200")}
        >
          हिन्दी
        </button>
        <button 
          onClick={() => setLang('en')}
          className={cn("px-4 py-2 rounded-xl font-bold transition-all", lang === 'en' ? "bg-orange-500 text-white" : "bg-white text-slate-600 border border-slate-200")}
        >
          English
        </button>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100"
      >
        <div className="text-center mb-10">
          <div className="bg-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-orange-500/30">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.loginTitle}</h1>
          <p className="text-slate-500 mt-2 font-medium">{t.loginSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">{t.username}</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="text" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder={t.username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">{t.password}</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="password" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

          <button 
            disabled={loading}
            type="submit" 
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? t.analyzing : t.loginBtn}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">सुरक्षित सरकारी पोर्टल</p>
          <div className="flex justify-center gap-4 mt-4 text-[10px] text-slate-400 font-bold">
            <span>ADMIN: admin123</span>
            <span>STAFF: staff123</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState<MalkhanaItem[]>([]);
  const [editingItem, setEditingItem] = useState<MalkhanaItem | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>('hi');
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchItems();
    setLoading(false);
  }, []);

  const fetchItems = async () => {
    try {
      const data = await api.getItems();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const handleAddItem = async (data: any) => {
    try {
      if (editingItem) {
        await api.updateItem(editingItem.id, data);
      } else {
        await api.addItem(data);
      }
      fetchItems();
      setActiveTab('inventory');
      setEditingItem(undefined);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const t = translations[lang];
    if (window.confirm(t.deleteConfirm)) {
      await api.deleteItem(id, user?.name || 'Unknown');
      fetchItems();
    }
  };

  if (loading) return null;

  if (!user) return <Login onLogin={handleLogin} lang={lang} setLang={setLang} />;

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Floating Chatbot Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white p-4 rounded-full shadow-2xl shadow-slate-900/40 flex items-center gap-3 group"
      >
        <div className="bg-orange-500 p-2 rounded-full">
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </div>
        {!isChatOpen && (
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap pr-2">
            {t.chatbotTitle}
          </span>
        )}
      </motion.button>

      {/* Floating Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
            className="fixed bottom-28 right-8 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-10rem)]"
          >
            <div className="h-full">
              <ChatWindow items={items} lang={lang} onClose={() => setIsChatOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setEditingItem(undefined);
        }} 
        onLogout={handleLogout}
        lang={lang}
        setLang={setLang}
      />

      <main className="ml-64 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {activeTab === 'dashboard' ? t.dashboard : 
               activeTab === 'inventory' ? t.inventory : 
               activeTab === 'add' ? (editingItem ? t.updateItem : t.addItem) : 
               activeTab === 'backlog' ? t.backlog : t.aiInsights}
            </h1>
            <p className="text-slate-500 font-medium">{t.welcome}, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 transition-colors">
              <Sun size={20} />
            </button>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t.systemOnline}</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard items={items} lang={lang} />}
            {activeTab === 'inventory' && (
              <InventoryList 
                items={items} 
                onDelete={handleDeleteItem} 
                onEdit={(item) => {
                  setEditingItem(item);
                  setActiveTab('add');
                }} 
                lang={lang}
              />
            )}
            {activeTab === 'add' && (
              <ItemForm 
                initialItem={editingItem} 
                onSubmit={handleAddItem} 
                onCancel={() => {
                  setActiveTab('inventory');
                  setEditingItem(undefined);
                }} 
                lang={lang}
              />
            )}
            {activeTab === 'ai' && <AIInsightsPanel items={items} lang={lang} />}
            {activeTab === 'backlog' && <BacklogView lang={lang} onRestore={fetchItems} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
