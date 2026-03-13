import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

// Green theme colors
const GREEN_COLORS = {
  primary: '#16a34a',
  primaryLight: '#4ade80',
  primaryDark: '#15803d',
  detected: '#ef4444',
  clean: '#22c55e',
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#22c55e',
  grid: '#e8f5e9',
  text: '#374151',
  textLight: '#6b7280',
  background: '#ffffff',
}

// Color palette for pie chart
const PIE_COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  
  return (
    <div style={{
      background: '#ffffff',
      border: '1.5px solid #e8f5e9',
      borderRadius: 16,
      padding: '12px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    }}>
      {label && (
        <p style={{
          fontSize: 11,
          color: '#6b7280',
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontFamily: '"Outfit", sans-serif',
        }}>
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <p key={i} style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: i < payload.length - 1 ? 6 : 0,
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: p.color || GREEN_COLORS.primary,
            display: 'inline-block',
          }} />
          <span style={{ color: '#6b7280' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: '#111827' }}>{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function MonthlyReportsChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barSize={32} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={GREEN_COLORS.grid} 
          vertical={false} 
        />
        <XAxis 
          dataKey="month" 
          tick={{ 
            fill: GREEN_COLORS.textLight, 
            fontSize: 12, 
            fontFamily: '"Outfit", sans-serif',
          }} 
          axisLine={false} 
          tickLine={false} 
        />
        <YAxis 
          tick={{ 
            fill: GREEN_COLORS.textLight, 
            fontSize: 12, 
            fontFamily: '"Outfit", sans-serif',
          }} 
          axisLine={false} 
          tickLine={false} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          iconType="circle"
          iconSize={8}
          wrapperStyle={{
            paddingTop: 16,
            fontFamily: '"Outfit", sans-serif',
            fontSize: 12,
          }}
        />
        <Bar 
          dataKey="total" 
          name="Total Reports" 
          fill={GREEN_COLORS.primaryLight} 
          radius={[6, 6, 0, 0]} 
          fillOpacity={0.7}
          animationDuration={1500}
        />
        <Bar 
          dataKey="detected" 
          name="Detected" 
          fill={GREEN_COLORS.detected} 
          radius={[6, 6, 0, 0]} 
          fillOpacity={0.9}
          animationDuration={1500}
        />
        <Bar 
          dataKey="clean" 
          name="Clean" 
          fill={GREEN_COLORS.clean} 
          radius={[6, 6, 0, 0]} 
          fillOpacity={0.9}
          animationDuration={1500}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DetectionTrendChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={GREEN_COLORS.grid} 
          vertical={false} 
        />
        <XAxis 
          dataKey="month" 
          tick={{ 
            fill: GREEN_COLORS.textLight, 
            fontSize: 12, 
            fontFamily: '"Outfit", sans-serif',
          }} 
          axisLine={false} 
          tickLine={false} 
        />
        <YAxis 
          tick={{ 
            fill: GREEN_COLORS.textLight, 
            fontSize: 12, 
            fontFamily: '"Outfit", sans-serif',
          }} 
          axisLine={false} 
          tickLine={false} 
          unit="%"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          iconType="circle"
          iconSize={8}
          wrapperStyle={{
            paddingTop: 16,
            fontFamily: '"Outfit", sans-serif',
            fontSize: 12,
          }}
        />
        <Line 
          dataKey="detection_rate" 
          name="Detection Rate" 
          stroke={GREEN_COLORS.primary} 
          strokeWidth={3}
          dot={{ 
            fill: GREEN_COLORS.primary, 
            r: 4,
            strokeWidth: 2,
            stroke: '#ffffff',
          }}
          activeDot={{ 
            r: 6,
            fill: GREEN_COLORS.primaryDark,
            stroke: '#ffffff',
            strokeWidth: 2,
          }}
          animationDuration={1500}
        />
        {/* Optional: Add confidence interval or target line */}
        <Line 
          dataKey="target" 
          name="Target" 
          stroke="#9ca3af" 
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          animationDuration={1500}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function RiskLevelPieChart({ data = [] }) {
  // Sort data by severity
  const sortedData = [...data].sort((a, b) => {
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    return (order[a.name] || 4) - (order[b.name] || 4)
  })

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
        <Pie
          data={sortedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
          animationDuration={1500}
          animationBegin={200}
        >
          {sortedData.map((entry, index) => {
            // Color based on risk level
            let color = GREEN_COLORS.primary
            if (entry.name === 'CRITICAL') color = GREEN_COLORS.critical
            else if (entry.name === 'HIGH') color = GREEN_COLORS.high
            else if (entry.name === 'MEDIUM') color = GREEN_COLORS.medium
            else if (entry.name === 'LOW') color = GREEN_COLORS.low
            
            return (
              <Cell 
                key={`cell-${index}`} 
                fill={color}
                stroke="#ffffff"
                strokeWidth={2}
              />
            )
          })}
        </Pie>
        
        <Tooltip content={<CustomTooltip />} />
        
        <Legend
          iconType="circle"
          iconSize={8}
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{
            paddingTop: 20,
            fontFamily: '"Outfit", sans-serif',
            fontSize: 12,
          }}
          formatter={(value) => (
            <span style={{ color: '#374151', textTransform: 'capitalize' }}>
              {value.toLowerCase()}
            </span>
          )}
        />
        
        {/* Optional: Add center text with total */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 16,
            fontWeight: 600,
            fill: '#0d1f0d',
          }}
        >
          {data.reduce((sum, item) => sum + item.value, 0)}
        </text>
      </PieChart>
    </ResponsiveContainer>
  )
}

// Additional chart: Stacked Bar Chart for Report Composition
export function ReportCompositionChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barSize={40} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GREEN_COLORS.grid} vertical={false} />
        <XAxis 
          dataKey="month" 
          tick={{ fill: GREEN_COLORS.textLight, fontSize: 12 }} 
          axisLine={false} 
          tickLine={false} 
        />
        <YAxis 
          tick={{ fill: GREEN_COLORS.textLight, fontSize: 12 }} 
          axisLine={false} 
          tickLine={false} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ paddingTop: 16, fontFamily: '"Outfit", sans-serif' }}
        />
        <Bar 
          dataKey="clean" 
          stackId="a" 
          name="Clean" 
          fill={GREEN_COLORS.clean} 
          radius={[4, 4, 0, 0]}
          animationDuration={1500}
        />
        <Bar 
          dataKey="detected" 
          stackId="a" 
          name="Detected" 
          fill={GREEN_COLORS.detected} 
          radius={[4, 4, 0, 0]}
          animationDuration={1500}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}