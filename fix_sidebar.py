#!/usr/bin/env python3
"""
PHASE 2+7: Sidebar Redesign + Responsive Fix + Dark Theme
All-in-one script to avoid multiple file reads/writes.
"""

import re

FILE = '/home/z/my-project/src/app/page.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# ═══════════════════════════════════════════════════════════════
# 1. REPLACE navItems with navGroups
# ═══════════════════════════════════════════════════════════════

old_navitems = """  const navItems = [
    { id: 'dashboard' as Section, label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'vocabulary' as Section, label: 'المفردات', icon: BookOpen },
    { id: 'pinyin' as Section, label: 'البينين', icon: Languages },
    { id: 'hanzi' as Section, label: 'الحروف', icon: PenTool },
    { id: 'grammar' as Section, label: 'القواعد', icon: GraduationCap },
    { id: 'lessons' as Section, label: 'الدروس', icon: BookOpenText },
    { id: 'conversations' as Section, label: 'المحادثات', icon: MessageSquare },
    { id: 'sentences' as Section, label: 'الجمل', icon: MessageCircle },
    { id: 'stories' as Section, label: 'القصص', icon: BookMarked },
    { id: 'practice' as Section, label: 'التمارين', icon: Target },
    { id: 'games' as Section, label: 'الألعاب', icon: Gamepad2 },
    { id: 'qa' as Section, label: 'أسئلة شائعة', icon: HelpCircle },
    { id: 'visual-dict' as Section, label: 'القاموس والنطق', icon: Image },
    { id: 'exam' as Section, label: 'محاكي الامتحان', icon: FileText },
    { id: 'achievements' as Section, label: 'الإنجازات', icon: Medal },
    { id: 'chat' as Section, label: 'المساعد', icon: Bot },
    { id: 'roadmap' as Section, label: 'خريطة الطريق', icon: Map },
  ]"""

new_navgroups = """  const navGroups = [
    {
      title: 'الرئيسية',
      items: [
        { id: 'dashboard' as Section, label: 'الرئيسية', icon: LayoutDashboard },
      ]
    },
    {
      title: 'التعلم',
      items: [
        { id: 'vocabulary' as Section, label: 'المفردات والنطق', icon: BookOpen },
        { id: 'grammar' as Section, label: 'القواعد', icon: GraduationCap },
        { id: 'sentences' as Section, label: 'الجمل', icon: MessageCircle },
        { id: 'stories' as Section, label: 'القصص', icon: BookMarked },
        { id: 'conversations' as Section, label: 'المحادثات', icon: MessageSquare },
      ]
    },
    {
      title: 'التدريب',
      items: [
        { id: 'practice' as Section, label: 'التمارين', icon: Target },
        { id: 'games' as Section, label: 'الألعاب', icon: Gamepad2 },
        { id: 'exam' as Section, label: 'محاكي الامتحان', icon: FileText },
      ]
    },
    {
      title: 'الأدوات',
      items: [
        { id: 'pinyin' as Section, label: 'البينين', icon: Languages },
        { id: 'hanzi' as Section, label: 'الحروف', icon: PenTool },
        { id: 'visual-dict' as Section, label: 'القاموس البصري', icon: Image },
        { id: 'lessons' as Section, label: 'الدروس', icon: BookOpenText },
      ]
    },
    {
      title: 'أخرى',
      items: [
        { id: 'roadmap' as Section, label: 'خريطة الطريق', icon: Map },
        { id: 'achievements' as Section, label: 'الإنجازات', icon: Medal },
        { id: 'chat' as Section, label: 'المساعد الذكي', icon: Bot },
      ]
    },
  ]

  // Flat list for mobile bottom nav (first 5 items)
  const mobileNavItems = navGroups.flatMap(g => g.items).slice(0, 5)"""

assert old_navitems in content, "Could not find old navItems block!"
content = content.replace(old_navitems, new_navgroups)

# ═══════════════════════════════════════════════════════════════
# 2. REPLACE LAYOUT CONTAINER
# ═══════════════════════════════════════════════════════════════

content = content.replace(
    '<div className="flex-1 flex max-w-7xl mx-auto w-full">',
    '<div className="flex-1 flex w-full min-h-screen">'
)

# ═══════════════════════════════════════════════════════════════
# 3. REPLACE MAIN TAG
# ═══════════════════════════════════════════════════════════════

content = content.replace(
    '<main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6 animate-fade-in" key={currentSection}>',
    '<main className="flex-1 p-3 md:p-5 lg:p-6 pb-24 lg:pb-6 animate-fade-in min-w-0" key={currentSection}>'
)

# ═══════════════════════════════════════════════════════════════
# 4. REPLACE SIDEBAR JSX (entire nav block)
# ═══════════════════════════════════════════════════════════════

old_sidebar = """        {/* ─── Sidebar Navigation (Desktop) ──────────────── */}
        <nav className={`hidden lg:flex flex-col border-l border-gray-100 p-3 gap-1 sticky top-[60px] self-start max-h-[calc(100vh-60px)] overflow-y-auto custom-scrollbar bg-white/50 transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-16'}`}>
          {/* Toggle button */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors self-start mb-1">
            {sidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>

          {/* User info */}
          <div className={`flex items-center gap-3 p-2 mb-2 rounded-xl bg-gradient-to-l from-[#E8F0FA] to-white ${sidebarOpen ? '' : 'justify-center p-2'}`}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0" style={{ background: 'linear-gradient(135deg, #1A5FA8, #0D4E82)' }}>
              {currentUser?.isGuest ? '👋' : currentUser?.name?.charAt(0) || '?'}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">{currentUser?.name || 'زائر'}</div>
                <div className="text-[10px] text-gray-500">{currentUser?.isGuest ? 'زائر' : 'مستخدم'} • {learnedWords.length} محفوظة</div>
              </div>
            )}
          </div>
          <div className="h-px bg-gray-100 mb-2" />
          {navItems.map(item => {
            if (item.id === 'lessons') {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => { setCurrentSection(item.id); setLessonsOpen(!lessonsOpen) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <item.icon className="w-5 h-5 text-gray-400 shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-right">{item.label}</span>
                        <span className="text-[10px] text-gray-400 transition-transform" style={{ transform: lessonsOpen ? 'rotate(90deg)' : 'rotate(0)' }}>▸</span>
                      </>
                    )}
                  </button>
                  {lessonsOpen && sidebarOpen && (
                    <div className="mr-8 mb-1 space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                      {lessonNames.map((ln, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setCurrentSection('lessons'); if (store.setCurrentLesson) store.setCurrentLesson(i + 1); }}
                          className="w-full text-right text-xs text-gray-500 hover:text-[#1A5FA8] hover:bg-[#F0FAFF] py-1.5 px-3 rounded-lg transition-all truncate"
                        >
                          {i + 1}. {ln}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
            return (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className={currentSection === item.id
                  ? "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all bg-[#E8F0FA] text-[#1A5FA8] shadow-sm"
                  : "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              >
                <item.icon className={currentSection === item.id ? "w-5 h-5 text-[#1A5FA8]" : "w-5 h-5 text-gray-400 shrink-0"} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            )
          })}
          {/* Progress (shown when open) */}
          {sidebarOpen && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-b from-[#E8F0FA] to-[#F0FAFF]">
              <div className="text-xs text-gray-600 mb-2 font-medium">التقدم العام</div>
              <div className="progress-duo mb-1">
                <div className="progress-duo-fill" style={{ width: `${stats.progress}%` }} />
              </div>
              <div className="text-xs text-gray-500 text-center">{stats.progress}%</div>
            </div>
          )}
          {/* Logout button */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <button
              onClick={() => { localStorage.removeItem('jisr_currentUser'); localStorage.removeItem('mudann_currentUser'); setCurrentUser(null); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-500 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>تسجيل الخروج</span>}
            </button>
          </div>
        </nav>"""

new_sidebar = """        {/* ─── Sidebar Navigation (Desktop) ──────────────── */}
        <nav className={"hidden lg:flex flex-col border-l border-[#1E3368] p-3 gap-1 sticky top-[60px] self-start max-h-[calc(100vh-60px)] overflow-y-auto custom-scrollbar bg-[#0D1B3E] transition-all duration-300 " + (sidebarOpen ? 'w-64' : 'w-16')}>
          {/* Toggle button */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-[#1E3368] text-[#94A3B8] hover:text-[#E2E8F0] transition-colors self-start mb-1">
            {sidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>

          {/* User info */}
          <div className={"flex items-center gap-3 p-2 mb-2 rounded-xl bg-gradient-to-l from-[#1A2C5B] to-[#152347] " + (sidebarOpen ? '' : 'justify-center p-2')}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0" style={{ background: 'linear-gradient(135deg, #1A5FA8, #0D4E82)' }}>
              {currentUser?.isGuest ? '👋' : currentUser?.name?.charAt(0) || '?'}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#E2E8F0] truncate">{currentUser?.name || 'زائر'}</div>
                <div className="text-[10px] text-[#94A3B8]">{currentUser?.isGuest ? 'زائر' : 'مستخدم'} • {learnedWords.length} محفوظة</div>
              </div>
            )}
          </div>
          <div className="h-px bg-[#1E3368] mb-2" />
          {/* Nav groups */}
          {navGroups.map((group, gi) => (
            <div key={gi} className="mb-1">
              {sidebarOpen && (
                <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider px-3 pt-2 pb-1">{group.title}</div>
              )}
              {group.items.map(item => {
                if (item.id === 'lessons') {
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => { setCurrentSection(item.id); setLessonsOpen(!lessonsOpen) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-[#94A3B8] hover:bg-[#1E3368] hover:text-[#E2E8F0]"
                      >
                        <item.icon className="w-5 h-5 text-[#64748B] shrink-0" />
                        {sidebarOpen && (
                          <>
                            <span className="flex-1 text-right">{item.label}</span>
                            <span className="text-[10px] text-[#64748B] transition-transform" style={{ transform: lessonsOpen ? 'rotate(90deg)' : 'rotate(0)' }}>▸</span>
                          </>
                        )}
                      </button>
                      {lessonsOpen && sidebarOpen && (
                        <div className="mr-8 mb-1 space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                          {lessonNames.map((ln, i) => (
                            <button
                              key={i}
                              onClick={(e) => { e.stopPropagation(); setCurrentSection('lessons'); if (store.setCurrentLesson) store.setCurrentLesson(i + 1); }}
                              className="w-full text-right text-xs text-[#94A3B8] hover:text-[#60A5FA] hover:bg-[#1E3368] py-1.5 px-3 rounded-lg transition-all truncate"
                            >
                              {i + 1}. {ln}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentSection(item.id)}
                    className={currentSection === item.id
                      ? "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all bg-[#1A5FA8]/20 text-[#60A5FA] shadow-sm"
                      : "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-[#94A3B8] hover:bg-[#1E3368] hover:text-[#E2E8F0]"
                    }
                  >
                    <item.icon className={currentSection === item.id ? "w-5 h-5 text-[#60A5FA]" : "w-5 h-5 text-[#64748B] shrink-0"} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                )
              })}
            </div>
          ))}
          {/* Progress (shown when open) */}
          {sidebarOpen && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-b from-[#1A2C5B] to-[#152347]">
              <div className="text-xs text-[#94A3B8] mb-2 font-medium">التقدم العام</div>
              <div className="progress-duo mb-1">
                <div className="progress-duo-fill" style={{ width: stats.progress + "%" }} />
              </div>
              <div className="text-xs text-[#64748B] text-center">{stats.learned}/410 محفوظة</div>
            </div>
          )}
          {/* Logout button */}
          <div className="mt-auto pt-4 border-t border-[#1E3368]">
            <button
              onClick={() => { localStorage.removeItem('jisr_currentUser'); localStorage.removeItem('mudann_currentUser'); setCurrentUser(null); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-[#94A3B8] hover:bg-red-900/20 hover:text-red-400"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>تسجيل الخروج</span>}
            </button>
          </div>
        </nav>"""

assert old_sidebar in content, "Could not find old sidebar JSX block!"
content = content.replace(old_sidebar, new_sidebar)

# ═══════════════════════════════════════════════════════════════
# 5. REPLACE MOBILE BOTTOM NAV
# ═══════════════════════════════════════════════════════════════

old_mobile = """        {/* ─── Mobile Bottom Navigation ──────────────────── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around py-2 px-1 safe-area-bottom">
          {navItems.slice(0, 5).map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentSection(item.id); incrementStreak() }}
              className={currentSection === item.id
                ? "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[50px] text-[#1A5FA8]"
                : "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[50px] text-gray-400"
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => {
              const moreSections: Section[] = ['pinyin', 'hanzi', 'lessons', 'conversations', 'sentences', 'stories', 'grammar', 'practice', 'games', 'qa', 'visual-dict', 'exam', 'achievements', 'chat', 'roadmap']
              const currentIdx = moreSections.indexOf(store.currentSection as Section)
              const nextIdx = (currentIdx + 1) % moreSections.length
              setCurrentSection(moreSections[nextIdx])
            }}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[50px] text-gray-400"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">المزيد</span>
          </button>
        </nav>"""

new_mobile = """        {/* ─── Mobile Bottom Navigation ──────────────────── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0D1B3E] border-t border-[#1E3368] flex justify-around py-2 px-1 safe-area-bottom">
          {mobileNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setCurrentSection(item.id); incrementStreak() }}
              className={currentSection === item.id
                ? "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[50px] text-[#60A5FA]"
                : "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[50px] text-[#64748B]"
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => {
              const moreSections: Section[] = ['pinyin', 'hanzi', 'lessons', 'conversations', 'sentences', 'stories', 'grammar', 'practice', 'games', 'qa', 'visual-dict', 'exam', 'achievements', 'chat', 'roadmap']
              const currentIdx = moreSections.indexOf(store.currentSection as Section)
              const nextIdx = (currentIdx + 1) % moreSections.length
              setCurrentSection(moreSections[nextIdx])
            }}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[50px] text-[#64748B]"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">المزيد</span>
          </button>
        </nav>"""

assert old_mobile in content, "Could not find old mobile nav block!"
content = content.replace(old_mobile, new_mobile)

# ═══════════════════════════════════════════════════════════════
# 6. DARK THEME BULK REPLACEMENTS
# ═══════════════════════════════════════════════════════════════
# Order matters: more specific patterns first, then generic

replacements = [
    # Header area
    ('bg-white/95 backdrop-blur-sm', 'bg-[#0D1B3E]/95 backdrop-blur-sm'),
    ('border-b border-gray-100 shadow-sm', 'border-b border-[#1E3368] shadow-sm'),
    
    # Badge colors (already changed in sidebar, but search whole file)
    ('bg-amber-50 text-amber-700 border-amber-200', 'bg-amber-900/30 text-amber-300 border-amber-800'),
    ('bg-blue-50 text-blue-700 border-blue-200', 'bg-blue-900/30 text-blue-300 border-blue-800'),
    
    # Backgrounds
    ('bg-white/50', 'bg-[#0D1B3E]/80'),
    
    # From/to gradients
    ('from-[#E8F0FA] to-[#F0FAFF]', 'from-[#1A2C5B] to-[#152347]'),
    ('from-[#E8F0FA]', 'from-[#1A2C5B]'),
    ('to-white', 'to-[#152347]'),
    
    # Hover states
    ('hover:bg-gray-50', 'hover:bg-[#1E3368]'),
    ('hover:bg-gray-100', 'hover:bg-[#253556]'),
    ('hover:text-gray-700', 'hover:text-[#E2E8F0]'),
    ('hover:text-gray-900', 'hover:text-[#E2E8F0]'),
    ('hover:bg-red-50 hover:text-red-600', 'hover:bg-red-900/20 hover:text-red-400'),
    ('hover:text-red-600', 'hover:text-red-400'),
    
    # Special: hover:bg-[#F0FAFF] in lessons dropdown already handled in sidebar, but check file
    ('hover:bg-[#F0FAFF]', 'hover:bg-[#1E3368]'),
    ('hover:text-[#1A5FA8]', 'hover:text-[#60A5FA]'),
    
    # Blue accents
    ('bg-blue-50', 'bg-blue-900/30'),
    ('text-blue-700', 'text-blue-300'),
    ('border-blue-200', 'border-blue-800'),
    
    # Amber accents
    ('bg-amber-50', 'bg-amber-900/30'),
    ('text-amber-700', 'text-amber-300'),
    ('border-amber-200', 'border-amber-800'),
    
    # Red accents
    ('bg-red-50', 'bg-red-900/20'),
    
    # Background colors (generic, after more specific)
    ('"bg-white"', '"bg-[#1A2C5B]"'),
    (' bg-white ', ' bg-[#1A2C5B] '),
    ('bg-gray-50', 'bg-[#152347]'),
    ('bg-gray-100', 'bg-[#1E3368]'),
    
    # Text colors (generic)
    ('text-gray-900', 'text-[#E2E8F0]'),
    ('text-gray-700', 'text-[#CBD5E1]'),
    ('text-gray-600', 'text-[#94A3B8]'),
    ('text-gray-500', 'text-[#94A3B8]'),
    ('text-gray-400', 'text-[#64748B]'),
    
    # Border colors (generic)
    ('border-gray-100', 'border-[#1E3368]'),
    ('border-gray-200', 'border-[#1E3368]'),
]

for old, new in replacements:
    count = content.count(old)
    if count > 0:
        content = content.replace(old, new)
        print(f"  ✓ Replaced '{old}' → '{new}' ({count} occurrences)")
    # else:
    #     print(f"  - Skipped (not found): '{old}'")

# ═══════════════════════════════════════════════════════════════
# 7. WRITE BACK
# ═══════════════════════════════════════════════════════════════

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n✅ All replacements applied successfully!")
print(f"File: {FILE}")
