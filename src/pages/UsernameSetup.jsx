import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, GraduationCap, ArrowRight, Swords, ChefHat } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '../components/BrandIcons'
import { useUserHandles } from '../context/UserContext'

const fields = [
  {
    key: 'github',
    label: 'GitHub Username',
    icon: GithubIcon,
    placeholder: 'octocat',
  },
  {
    key: 'leetcode',
    label: 'LeetCode Username',
    icon: Code2,
    placeholder: 'leetcode_user',
  },
  {
    key: 'codeforces',
    label: 'Codeforces Handle',
    icon: Swords,
    placeholder: 'tourist',
  },
  {
    key: 'codechef',
    label: 'CodeChef Username',
    icon: ChefHat,
    placeholder: 'codechef_user',
  },
  {
    key: 'gfg',
    label: 'GeeksforGeeks Username',
    icon: GraduationCap,
    placeholder: 'gfg_user',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn Profile (handle or URL)',
    icon: LinkedinIcon,
    placeholder: 'in/your-name',
  },
]

export default function UsernameSetup() {
  const { handles, setHandles } = useUserHandles()
  const [form, setForm] = useState(handles)
  const navigate = useNavigate()

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setHandles(form)
    navigate('/dashboard')
  }

  const filledCount = Object.values(form).filter((v) => v && v.trim()).length

  return (
    <div className="h-full min-h-0 bg-void flex items-center justify-center px-4 py-10 rounded-[28px] border border-hairline/70 shadow-[0_20px_60px_rgba(35,28,23,0.08)] backdrop-blur-2xl overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-widest text-signal font-mono mb-2">
            one-time setup
          </p>
          <h1 className="font-display text-2xl font-semibold text-chrome">
            Link your platforms
          </h1>
          <p className="text-sm text-chrome-dim mt-1">
            Enter your usernames once — DevTrack pulls everything else live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-[36px] p-8 flex flex-col gap-5 bg-gunmetal/30 border-hairline">
          {fields.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-widest text-chrome-dim flex items-center gap-1.5">
                <Icon size={13} />
                {label}
              </label>
              <input
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                placeholder={placeholder}
                className="bg-steel border border-hairline rounded-full px-5 py-3 text-sm font-mono outline-none focus:border-signal transition-colors"
              />
            </div>
          ))}

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-chrome-dim font-mono">
              {filledCount}/{fields.length} linked
            </span>
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-signal to-violet hover:opacity-90 transition-all text-void font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full cursor-pointer"
            >
              Build dashboard
              <ArrowRight size={15} />
            </button>
          </div>
        </form>

        <p className="text-xs text-chrome-dim mt-4 text-center">
          Leave a field blank to skip that platform — you can add it later from the Handles page.
        </p>
      </motion.div>
    </div>
  )
}
