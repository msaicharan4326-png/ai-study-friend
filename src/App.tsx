import { useEffect, useMemo, useState } from 'react';
import {
  AlarmClockCheck,
  BookOpen,
  BrainCircuit,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  Headphones,
  ImageIcon,
  LayoutGrid,
  Mic,
  Moon,
  NotebookPen,
  PencilLine,
  Play,
  Search,
  Sparkles,
  Star,
  SunMedium,
  Target,
  TimerReset,
  Trophy,
  Video,
  Wand2,
} from 'lucide-react';
import { addDays, format, isToday } from 'date-fns';
import { jsPDF } from 'jspdf';

import { sampleBoardOptions, sampleGoals, sampleSubjects, recommendedTopics } from './lib/mockData';
import { getGreeting, loadFromStorage, saveToStorage, storageKeys } from './lib/storage';
import { ChatMessage, NoteItem, StudySession, TodoItem, UserPreferences, UserProfile } from './types';

const defaultProfile: UserProfile = {
  id: 'demo-user',
  name: 'Aarav',
  email: 'aarav@student.ai',
  ageGroup: 'Class 10',
  preferences: {
    level: 'Class 9-10',
    board: 'CBSE',
    primaryLanguage: 'English',
    subjects: ['Mathematics', 'Science', 'English'],
    goals: ['Improve concept clarity', 'Prepare for unit tests'],
    explanationStyle: 'Step-by-step',
    dailyTargetMinutes: 90,
  },
  createdAt: new Date().toISOString(),
};

const defaultNotes: NoteItem[] = [
  {
    id: 'n1',
    title: 'Quadratic formula recap',
    body: 'Use x = (-b ± sqrt(b² - 4ac)) / 2a and check discriminant before solving.',
    subject: 'Mathematics',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    title: 'Photosynthesis',
    body: 'Plants convert carbon dioxide and water into glucose and oxygen using sunlight.',
    subject: 'Science',
    updatedAt: new Date().toISOString(),
  },
];

const defaultSessions: StudySession[] = [
  { id: 's1', subject: 'Mathematics', minutes: 45, completedAt: new Date().toISOString() },
  { id: 's2', subject: 'Science', minutes: 30, completedAt: addDays(new Date(), -1).toISOString() },
  { id: 's3', subject: 'English', minutes: 20, completedAt: addDays(new Date(), -2).toISOString() },
];

const defaultTasks: TodoItem[] = [
  { id: 't1', title: 'Revise Chapter 3', due: new Date().toISOString(), completed: false },
  { id: 't2', title: 'Prepare for physics quiz', due: addDays(new Date(), 1).toISOString(), completed: false },
  { id: 't3', title: 'Finish biology worksheet', due: addDays(new Date(), 2).toISOString(), completed: true },
];

const createAssistantReply = (question: string) => {
  const cleaned = question.trim();
  if (!cleaned) return 'Tell me what you want to learn about, and I will make it simple.';
  if (/photosyn|plant/i.test(cleaned)) {
    return 'Photosynthesis is the process plants use to make food using sunlight, water, and carbon dioxide. The key equation is: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Try remembering that sunlight is the energy source, while chlorophyll captures it.';
  }
  if (/quadratic|equation|math/i.test(cleaned)) {
    return 'For a quadratic equation ax² + bx + c = 0, first compute the discriminant D = b² - 4ac. If D > 0, two real roots exist; if D = 0, one repeated root; if D < 0, there are no real roots. Then use x = (-b ± √D)/(2a).';
  }
  if (/telugu|తెలుగు/i.test(cleaned)) {
    return 'తెలుగు మాట్లాడినప్పుడు, సులభంగా అర్థమయ్యే ఉదాహరణలతో వివరించవచ్చు. ఉదాహరణ: “సూర్యరశ్మి, నీరు మరియు CO₂ వాడి మొక్క ఆహారం తయారు చేస్తుంది.” మీరు నా సహాయంతో ఒక ప్రశ్నను కూడా పరిష్కరించవచ్చు.';
  }
  if (/quiz|practice/i.test(cleaned)) {
    return 'Let’s do a quick practice round. Question: The product of 6 and 7 is? Answer: 42. Would you like a 3-question mini quiz on this topic?';
  }
  return `I understand you are asking about: “${cleaned}”. I’d explain it in a friendly way, break it into simple steps, and help with a practice question if needed. If you want, I can also explain this in Telugu or in exam mode.`;
};

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadFromStorage(storageKeys.theme, 'light'));
  const [profile, setProfile] = useState<UserProfile>(() => loadFromStorage(storageKeys.user, defaultProfile));
  const [notes, setNotes] = useState<NoteItem[]>(() => loadFromStorage(storageKeys.notes, defaultNotes));
  const [sessions, setSessions] = useState<StudySession[]>(() => loadFromStorage(storageKeys.sessions, defaultSessions));
  const [tasks, setTasks] = useState<TodoItem[]>(() => loadFromStorage(storageKeys.tasks, defaultTasks));
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadFromStorage(storageKeys.messages, initialMessages));
  const [activeTab, setActiveTab] = useState<'home' | 'learn' | 'tutor' | 'tools' | 'profile'>('home');
  const [questionInput, setQuestionInput] = useState('');
  const [noteDraft, setNoteDraft] = useState({ title: '', body: '', subject: 'Mathematics' as UserPreferences['subjects'][number] });
  const [scannerText, setScannerText] = useState('');
  const [scannerSolution, setScannerSolution] = useState('');
  const [timer, setTimer] = useState({ minutes: 25, seconds: 0, running: false, mode: 'Focus' as 'Focus' | 'Break' });
  const [draftOnboarding, setDraftOnboarding] = useState<UserPreferences>(profile.preferences);
  const [screen, setScreen] = useState<'sign-in' | 'onboarding' | 'app'>('app');

  useEffect(() => {
    saveToStorage(storageKeys.user, profile);
  }, [profile]);

  useEffect(() => {
    saveToStorage(storageKeys.notes, notes);
  }, [notes]);

  useEffect(() => {
    saveToStorage(storageKeys.sessions, sessions);
  }, [sessions]);

  useEffect(() => {
    saveToStorage(storageKeys.tasks, tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage(storageKeys.messages, messages);
  }, [messages]);

  useEffect(() => {
    saveToStorage(storageKeys.theme, theme);
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!timer.running) return;
    const interval = setInterval(() => {
      setTimer((current) => {
        if (current.seconds === 0) {
          if (current.minutes === 0) {
            return { ...current, running: false, mode: current.mode === 'Focus' ? 'Break' : 'Focus', minutes: current.mode === 'Focus' ? 5 : 25, seconds: 0 };
          }
          return { ...current, minutes: current.minutes - 1, seconds: 59 };
        }
        return { ...current, seconds: current.seconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.running]);

  const totalStudyMinutes = useMemo(
    () => sessions.reduce((sum, session) => sum + session.minutes, 0),
    [sessions],
  );

  const streak = useMemo(() => {
    let count = 0;
    let dateCursor = new Date();
    while (count < 7) {
      if (sessions.some((session) => isToday(new Date(session.completedAt)))) {
        count += 1;
        dateCursor = new Date(dateCursor.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }
    return count;
  }, [sessions]);

  const handleAsk = () => {
    const trimmed = questionInput.trim();
    if (!trimmed) return;
    const userMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const assistantMessage: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: createAssistantReply(trimmed),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setQuestionInput('');
    setActiveTab('tutor');
  };

  const handleAddNote = () => {
    if (!noteDraft.title.trim() && !noteDraft.body.trim()) return;
    const nextNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: noteDraft.title || 'Untitled note',
      body: noteDraft.body || 'New study note',
      subject: noteDraft.subject,
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [nextNote, ...prev]);
    setNoteDraft({ title: '', body: '', subject: 'Mathematics' });
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    );
  };

  const handleTimerSave = () => {
    const session: StudySession = {
      id: `session-${Date.now()}`,
      subject: profile.preferences.subjects[0] ?? 'Mathematics',
      minutes: 25,
      completedAt: new Date().toISOString(),
    };
    setSessions((prev) => [session, ...prev]);
    setTimer({ minutes: 25, seconds: 0, running: false, mode: 'Focus' });
  };

  const handleScanImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extracted = `Extracted question preview from ${file.name}:\n\n1. A train travels 120 km in 2 hours. Find its average speed.\n2. What is the derivative of x² + 3x + 5?`;
    const solution = 'Step 1: Average speed = total distance / total time = 120 / 2 = 60 km/h. Step 2: d/dx(x² + 3x + 5) = 2x + 3.';
    setScannerText(extracted);
    setScannerSolution(solution);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('AI Study Friend - Revision Sheet', 14, 20);
    doc.setFontSize(12);
    doc.text('Topic: Quadratic equations', 14, 35);
    doc.text('Important formula: x = (-b ± √(b² - 4ac)) / 2a', 14, 50);
    doc.text('Example: Solve x² - 5x + 6 = 0 -> x = 2 or 3', 14, 65);
    doc.save('study-friend-notes.pdf');
  };

  const renderHome = () => (
    <div className="page-shell">
      <div className="top-header">
        <div>
          <p className="eyebrow">{getGreeting()}!</p>
          <h1>Welcome back, {profile.name}</h1>
        </div>
        <button className="ghost-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? <Moon size={18} /> : <SunMedium size={18} />}
        </button>
      </div>

      <div className="search-card card">
        <Search size={16} />
        <input
          value={questionInput}
          onChange={(event) => setQuestionInput(event.target.value)}
          placeholder="Ask AI study buddy anything..."
        />
        <button className="primary-button" onClick={handleAsk}>Ask AI</button>
      </div>

      <div className="quick-grid">
        <button className="feature-card card" onClick={() => setActiveTab('tutor')}>
          <Mic size={18} />
          <span>Talk to AI</span>
        </button>
        <button className="feature-card card" onClick={() => setActiveTab('tools')}>
          <Camera size={18} />
          <span>Scan and solve</span>
        </button>
        <button className="feature-card card" onClick={() => exportPdf()}>
          <FileText size={18} />
          <span>Create PDF</span>
        </button>
        <button className="feature-card card" onClick={() => setScreen('onboarding')}>
          <Sparkles size={18} />
          <span>Customize learning</span>
        </button>
      </div>

      <div className="row-two">
        <div className="card panel">
          <div className="panel-header">
            <h3>Continue learning</h3>
            <ChevronRight size={16} />
          </div>
          <ul className="plain-list">
            <li>
              <BookOpen size={16} />
              <span>Photosynthesis summary</span>
              <strong>12 min</strong>
            </li>
            <li>
              <BrainCircuit size={16} />
              <span>Functions in algebra</span>
              <strong>18 min</strong>
            </li>
          </ul>
        </div>

        <div className="card panel timer-panel">
          <div className="panel-header">
            <h3>Study timer</h3>
            <Clock3 size={16} />
          </div>
          <div className="big-timer">
            {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
          </div>
          <div className="tiny-actions">
            <button className="primary-button" onClick={() => setTimer((prev) => ({ ...prev, running: !prev.running }))}>
              {timer.running ? 'Pause' : 'Start'}
            </button>
            <button className="secondary-button" onClick={handleTimerSave}>Save session</button>
          </div>
        </div>
      </div>

      <div className="card panel">
        <div className="panel-header">
          <h3>Today’s timetable</h3>
          <Target size={16} />
        </div>
        <div className="timetable-grid">
          {[
            ['08:30', 'Math revision'],
            ['10:00', 'Science lab prep'],
            ['12:30', 'English writing'],
            ['18:00', 'AI quiz'],
          ].map(([time, label]) => (
            <div key={time} className="timetable-item">
              <span>{time}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="row-two">
        <div className="card panel">
          <div className="panel-header">
            <h3>Upcoming tests</h3>
            <Trophy size={16} />
          </div>
          <ul className="plain-list compact">
            <li><span>Physics quiz</span><strong>Tomorrow</strong></li>
            <li><span>English test</span><strong>Friday</strong></li>
            <li><span>Math chapter review</span><strong>Sunday</strong></li>
          </ul>
        </div>

        <div className="card panel">
          <div className="panel-header">
            <h3>Progress</h3>
            <CheckCircle2 size={16} />
          </div>
          <div className="progress-box">
            <strong>{streak} day streak</strong>
            <span>{totalStudyMinutes} min studied this week</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLearn = () => (
    <div className="page-shell">
      <div className="top-header">
        <div>
          <p className="eyebrow">Learn</p>
          <h1>Study plan for your level</h1>
        </div>
      </div>

      <div className="card panel">
        <div className="panel-header">
          <h3>Recommended revision topics</h3>
          <Star size={16} />
        </div>
        <div className="tag-list">
          {recommendedTopics.map((topic) => (
            <span key={topic} className="tag">{topic}</span>
          ))}
        </div>
      </div>

      <div className="card panel">
        <div className="panel-header">
          <h3>Daily quiz</h3>
          <BrainCircuit size={16} />
        </div>
        <div className="question-card">
          <p>Question: What is the sum of angles of a triangle?</p>
          <div className="options-grid">
            <button>90°</button>
            <button className="selected">180°</button>
            <button>270°</button>
            <button>360°</button>
          </div>
        </div>
      </div>

      <div className="card panel">
        <div className="panel-header">
          <h3>Saved notes</h3>
          <NotebookPen size={16} />
        </div>
        <ul className="plain-list">
          {notes.map((note) => (
            <li key={note.id}>
              <span>
                <strong>{note.title}</strong>
                <small>{note.subject}</small>
              </span>
              <button className="ghost-button small">Open</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderTutor = () => (
    <div className="page-shell">
      <div className="top-header">
        <div>
          <p className="eyebrow">AI Tutor</p>
          <h1>Your study friend</h1>
        </div>
        <button className="ghost-button" title="Voice mode">
          <Headphones size={18} />
        </button>
      </div>

      <div className="card tutor-panel">
        <div className="chat-thread">
          {messages.map((message) => (
            <div key={message.id} className={`chat-bubble ${message.role}`}>
              {message.content}
            </div>
          ))}
        </div>
        <div className="chat-input-row">
          <input
            value={questionInput}
            onChange={(event) => setQuestionInput(event.target.value)}
            placeholder="Ask for an explanation, example, or quiz..."
          />
          <button className="primary-button" onClick={handleAsk}>Send</button>
        </div>
        <div className="voice-actions">
          <button className="secondary-button"><Mic size={16} /> Voice</button>
          <button className="secondary-button"><TimerReset size={16} /> Repeat</button>
          <button className="secondary-button"><Play size={16} /> Listen</button>
        </div>
      </div>
    </div>
  );

  const renderTools = () => (
    <div className="page-shell">
      <div className="top-header">
        <div>
          <p className="eyebrow">Tools</p>
          <h1>AI study workspace</h1>
        </div>
      </div>

      <div className="tool-grid">
        <button className="card tool-card" onClick={() => document.getElementById('scan-upload')?.click()}>
          <Camera size={18} />
          <span>Scan & solve</span>
        </button>
        <input id="scan-upload" type="file" accept="image/*" hidden onChange={handleScanImage} />

        <button className="card tool-card" onClick={() => exportPdf()}>
          <FileText size={18} />
          <span>Document studio</span>
        </button>

        <button className="card tool-card" onClick={() => setActiveTab('learn')}>
          <ImageIcon size={18} />
          <span>Image lab</span>
        </button>

        <button className="card tool-card" onClick={() => setActiveTab('learn')}>
          <Video size={18} />
          <span>Video studio</span>
        </button>

        <button className="card tool-card" onClick={() => setActiveTab('learn')}>
          <Wand2 size={18} />
          <span>Quiz generator</span>
        </button>
      </div>

      <div className="card panel">
        <div className="panel-header">
          <h3>Scan preview</h3>
          <PencilLine size={16} />
        </div>
        {scannerText ? (
          <>
            <pre>{scannerText}</pre>
            <div className="solution-box">
              <strong>Solution</strong>
              <p>{scannerSolution}</p>
            </div>
          </>
        ) : (
          <p className="muted">Upload an image of a question or textbook page to analyze it.</p>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="page-shell">
      <div className="top-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>{profile.name}</h1>
        </div>
      </div>

      <div className="card panel profile-card">
        <div className="profile-row">
          <div className="avatar">{profile.name.slice(0, 1)}</div>
          <div>
            <h3>{profile.name}</h3>
            <p>{profile.email}</p>
          </div>
        </div>

        <div className="profile-meta">
          <div>
            <span>Level</span>
            <strong>{profile.preferences.level}</strong>
          </div>
          <div>
            <span>Board</span>
            <strong>{profile.preferences.board}</strong>
          </div>
          <div>
            <span>Goal</span>
            <strong>{profile.preferences.goals[0]}</strong>
          </div>
        </div>
      </div>

      <div className="card panel">
        <div className="panel-header">
          <h3>Learning preferences</h3>
          <GraduationCap size={16} />
        </div>
        <div className="tag-list">
          {profile.preferences.subjects.map((subject) => (
            <span key={subject} className="tag">{subject}</span>
          ))}
        </div>
      </div>

      <div className="card panel">
        <div className="panel-header">
          <h3>Daily target</h3>
          <Target size={16} />
        </div>
        <p className="muted">{profile.preferences.dailyTargetMinutes} minutes each day</p>
      </div>

      <button className="secondary-button wide" onClick={() => setScreen('onboarding')}>Update preferences</button>
    </div>
  );

  const renderOnboarding = () => (
    <div className="page-shell form-shell">
      <div className="top-header">
        <div>
          <p className="eyebrow">Onboarding</p>
          <h1>Personalize your study journey</h1>
        </div>
      </div>

      <div className="card panel form-card">
        <label>
          Class or year
          <select value={draftOnboarding.level} onChange={(event) => setDraftOnboarding({ ...draftOnboarding, level: event.target.value as UserPreferences['level'] })}>
            <option value="Class 1-5">Class 1-5</option>
            <option value="Class 6-8">Class 6-8</option>
            <option value="Class 9-10">Class 9-10</option>
            <option value="Class 11-12">Class 11-12</option>
            <option value="B.Tech 1st Year">B.Tech 1st Year</option>
            <option value="B.Tech 2nd Year">B.Tech 2nd Year</option>
            <option value="B.Tech 3rd Year">B.Tech 3rd Year</option>
            <option value="B.Tech 4th Year">B.Tech 4th Year</option>
          </select>
        </label>

        <label>
          Education board
          <select value={draftOnboarding.board} onChange={(event) => setDraftOnboarding({ ...draftOnboarding, board: event.target.value })}>
            {sampleBoardOptions.map((board) => (
              <option key={board} value={board}>{board}</option>
            ))}
          </select>
        </label>

        <label>
          Preferred language
          <select value={draftOnboarding.primaryLanguage} onChange={(event) => setDraftOnboarding({ ...draftOnboarding, primaryLanguage: event.target.value as 'English' | 'Telugu' })}>
            <option value="English">English</option>
            <option value="Telugu">Telugu</option>
          </select>
        </label>

        <label>
          Subjects
          <div className="selection-grid">
            {sampleSubjects.map((subject) => (
              <button
                key={subject}
                className={`chip ${draftOnboarding.subjects.includes(subject) ? 'active' : ''}`}
                onClick={() => {
                  const exists = draftOnboarding.subjects.includes(subject);
                  setDraftOnboarding((prev) => ({
                    ...prev,
                    subjects: exists ? prev.subjects.filter((item) => item !== subject) : [...prev.subjects, subject],
                  }));
                }}
              >
                {subject}
              </button>
            ))}
          </div>
        </label>

        <label>
          Learning goals
          <div className="selection-grid">
            {sampleGoals.map((goal) => (
              <button
                key={goal}
                className={`chip ${draftOnboarding.goals.includes(goal) ? 'active' : ''}`}
                onClick={() => {
                  const exists = draftOnboarding.goals.includes(goal);
                  setDraftOnboarding((prev) => ({
                    ...prev,
                    goals: exists ? prev.goals.filter((item) => item !== goal) : [...prev.goals, goal],
                  }));
                }}
              >
                {goal}
              </button>
            ))}
          </div>
        </label>

        <label>
          Daily study target (minutes)
          <input
            type="number"
            value={draftOnboarding.dailyTargetMinutes}
            onChange={(event) => setDraftOnboarding({ ...draftOnboarding, dailyTargetMinutes: Number(event.target.value) || 30 })}
          />
        </label>

        <div className="tiny-actions">
          <button className="primary-button" onClick={() => {
            setProfile((prev) => ({ ...prev, preferences: draftOnboarding }));
            setScreen('app');
            setActiveTab('home');
          }}>
            Save preferences
          </button>
          <button className="secondary-button" onClick={() => setScreen('app')}>Back</button>
        </div>
      </div>
    </div>
  );

  const renderAuth = () => (
    <div className="auth-shell">
      <div className="auth-card card">
        <div className="brand-wrap">
          <div className="logo-mark">AI</div>
          <div>
            <p className="eyebrow">Study companion</p>
            <h1>AI Study Friend</h1>
          </div>
        </div>

        <label>
          Full name
          <input value={profile.name} onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))} />
        </label>

        <label>
          Email
          <input type="email" value={profile.email} onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))} />
        </label>

        <label>
          Password
          <input type="password" placeholder="••••••••" />
        </label>

        <button className="primary-button wide" onClick={() => setScreen('onboarding')}>Create account</button>
        <button className="secondary-button wide" onClick={() => setScreen('onboarding')}>Continue as guest</button>
      </div>
    </div>
  );

  const renderAppBody = () => {
    switch (activeTab) {
      case 'learn':
        return renderLearn();
      case 'tutor':
        return renderTutor();
      case 'tools':
        return renderTools();
      case 'profile':
        return renderProfile();
      case 'home':
      default:
        return renderHome();
    }
  };

  if (screen === 'sign-in') {
    return renderAuth();
  }

  if (screen === 'onboarding') {
    return renderOnboarding();
  }

  return (
    <div className="app-shell">
      <div className="content-area">{renderAppBody()}</div>
      <nav className="bottom-nav" aria-label="Main navigation">
        {[
          { id: 'home', label: 'Home', icon: LayoutGrid },
          { id: 'learn', label: 'Learn', icon: BookOpen },
          { id: 'tutor', label: 'AI Tutor', icon: BrainCircuit },
          { id: 'tools', label: 'Tools', icon: Wand2 },
          { id: 'profile', label: 'Profile', icon: GraduationCap },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} className={activeTab === id ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab(id as typeof activeTab)}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
