import { Link } from 'react-router-dom'
import {
  IconArrowLeft, IconGift, IconTrophy, IconBag, IconTarget,
  IconX, IconCheck, IconChart, IconSupport, IconStar,
} from '../components/Icons'

export default function EconomyRules() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/" className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1">
          <IconArrowLeft size={14} /> На главную
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mt-2">
          Как работает экономика
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Правила начисления, списания и оспаривания монет
        </p>
      </div>

      <Section icon={<IconGift size={20} />} title="Как заработать монеты" color="brand">
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
          <li><strong>Благодарности коллег</strong> — переводите друг другу до <strong>1000 монет в день</strong>.</li>
          <li><strong>События и мероприятия</strong> — награда назначается при одобрении события HR/админом.</li>
          <li><strong>Квесты</strong> — после проверки администратором начисляется указанная в квесте сумма.</li>
          <li><strong>Достижения</strong> — автоматически за активность или вручную от руководства.</li>
          <li><strong>Бонусы руководителя</strong> — до <strong>2000 монет</strong> одному сотруднику в день.</li>
          <li><strong>Сезоны</strong> — топ-3 и лучший отдел получают крупные выплаты.</li>
        </ul>
      </Section>

      <Section icon={<IconX size={20} />} title="За что могут списать" color="red">
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
          <li><strong>Покупки в магазине</strong> — оплата товаров и привилегий.</li>
          <li><strong>Штрафы от руководителя</strong> — за нарушение регламента, KPI, просрочки. Всегда указывается <strong>причина</strong> и <strong>кто наложил</strong>.</li>
          <li><strong>Невыполнение обязательных квестов</strong> — если указан штраф.</li>
          <li><strong>Непрохождение опросов</strong> — если указан штраф рейтинга.</li>
        </ul>
      </Section>

      <Section icon={<IconCheck size={20} />} title="Гарантии и прозрачность" color="brand">
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
          <li>Каждая операция попадает в <strong>историю монет</strong> с указанием отправителя, получателя, суммы и причины.</li>
          <li>Отменённые операции <strong>не удаляются</strong>, а помечаются как «отменено» с указанием причины.</li>
          <li>Штраф можно <strong>оспорить</strong> прямо из истории — создаётся обращение в поддержку.</li>
          <li>Средства из штрафов <strong>возвращаются в казну компании</strong>, а не «исчезают».</li>
          <li>Ежемесячный лимит заработка — <strong>10 000 монет</strong>. После него начисления приостанавливаются до нового месяца.</li>
        </ul>
      </Section>

      <Section icon={<IconSupport size={20} />} title="Что делать, если не согласен" color="amber">
        <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-decimal pl-5">
          <li>Откройте <Link to="/history/coins" className="text-brand-600 dark:text-brand-400 underline">Историю монет</Link>.</li>
          <li>Найдите нужную операцию и нажмите на неё.</li>
          <li>В деталях нажмите <strong>«Оспорить штраф»</strong> — создастся обращение в поддержку.</li>
          <li>Ответ придёт в разделе <Link to="/support" className="text-brand-600 dark:text-brand-400 underline">Поддержка</Link>.</li>
        </ol>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">
          Оспорить можно только штрафы, наложенные на вас. Списания за покупки и отменённые операции оспариванию не подлежат.
        </p>
      </Section>

      <Section icon={<IconChart size={20} />} title="Как читать историю" color="blue">
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
          <li><strong>Поступления</strong> (зелёным, +) — монеты, которые вам начислили.</li>
          <li><strong>Списания</strong> (красным, −) — монеты, которые вы потратили или с вас удержали.</li>
          <li><strong>Отменённые</strong> (серым, зачёркнуто) — операции, которые отменил администратор. Рядом указана причина.</li>
        </ul>
      </Section>
    </div>
  )
}

function Section({
  icon, title, color, children,
}: {
  icon: React.ReactNode
  title: string
  color: 'brand' | 'red' | 'amber' | 'blue'
  children: React.ReactNode
}) {
  const colors = {
    brand: 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400',
    red: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  }
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colors[color]}`}>
          {icon}
        </div>
        <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  )
}