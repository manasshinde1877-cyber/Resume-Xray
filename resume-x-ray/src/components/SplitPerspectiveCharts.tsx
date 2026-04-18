"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";

interface ChartData {
  name: string;
  value: number;
}

interface SplitPerspectiveChartsProps {
  atsData: ChartData[];
  recruiterData: ChartData[];
}

const ATS_COLORS = ["#06b6d4", "#0891b2", "#155e75", "#164e63"];
const RECRUITER_COLORS = ["#f59e0b", "#d97706", "#b45309", "#92400e"];

export function SplitPerspectiveCharts({ atsData, recruiterData }: SplitPerspectiveChartsProps) {
  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col items-center"
      >
        <h3 className="text-lg font-bold text-cyan-400 mb-2 uppercase tracking-tighter">ATS Algorithm Focus</h3>
        <p className="text-xs text-slate-500 mb-6 font-medium">How non-semantic layers weight your data</p>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={atsData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {atsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={ATS_COLORS[index % ATS_COLORS.length]} stroke="rgba(0,0,0,0.1)" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col items-center"
      >
        <h3 className="text-lg font-bold text-amber-500 mb-2 uppercase tracking-tighter">Recruiter High-Value Zones</h3>
        <p className="text-xs text-slate-500 mb-6 font-medium">Where human eyes instinctively pause</p>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={recruiterData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {recruiterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={RECRUITER_COLORS[index % RECRUITER_COLORS.length]} stroke="rgba(0,0,0,0.1)" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
