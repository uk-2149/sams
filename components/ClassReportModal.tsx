"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Download, FileText } from "lucide-react";
import type { ClassAnalytics } from "@/types";
import { subDays, startOfMonth, format } from "date-fns";

export function ClassReportModal({ classId }: { classId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [reportData, setReportData] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `/api/analytics/class/${classId}`;
      const params = new URLSearchParams();
      
      let start = "";
      let end = format(new Date(), "yyyy-MM-dd");

      if (filterType === "last_week") {
        start = format(subDays(new Date(), 7), "yyyy-MM-dd");
        params.append("startDate", start);
        params.append("endDate", end);
      } else if (filterType === "last_month") {
        start = format(subDays(new Date(), 30), "yyyy-MM-dd");
        params.append("startDate", start);
        params.append("endDate", end);
      } else if (filterType === "custom") {
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to fetch report");
      
      setReportData(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReport();
    }
  }, [isOpen, filterType, startDate, endDate]);

  const downloadCSV = () => {
    if (!reportData) return;
    
    const headers = ["SL no.", "Roll number", "Name", "Total Classes", "Classes Attended", "Percentage"];
    const rows = reportData.students.map((s, index) => [
      index + 1,
      s.rollNumber || "N/A",
      `"${s.name}"`, // Quote name to handle commas
      s.total,
      s.present,
      `${s.percentage}%`
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `class_report_${classId}_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          Show Report
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-5xl md:max-w-6xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Class Attendance Report</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 bg-zinc-50 p-3 rounded-lg border">
            <div className="flex-1 min-w-[200px]">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last_week">Last 7 Days</SelectItem>
                  <SelectItem value="last_month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filterType === "custom" && (
              <div className="flex items-center gap-2">
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="w-auto"
                />
                <span className="text-zinc-500">to</span>
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto" 
                />
              </div>
            )}
            
            <Button 
              onClick={downloadCSV} 
              disabled={!reportData || reportData.students.length === 0 || loading}
              className="ml-auto bg-zinc-900 hover:bg-black gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </Button>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}

          <div className="overflow-y-auto flex-1 border rounded-md">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
              </div>
            ) : reportData?.students.length ? (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 bg-zinc-50 uppercase sticky top-0 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-medium">SL no.</th>
                    <th className="px-4 py-3 font-medium">Roll Number</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium text-center">Total Classes</th>
                    <th className="px-4 py-3 font-medium text-center">Attended</th>
                    <th className="px-4 py-3 font-medium text-center">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reportData.students.map((s, index) => (
                    <tr key={s.studentId} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-500">{index + 1}</td>
                      <td className="px-4 py-3 font-medium">{s.rollNumber || "N/A"}</td>
                      <td className="px-4 py-3">{s.name}</td>
                      <td className="px-4 py-3 text-center">{s.total}</td>
                      <td className="px-4 py-3 text-center">{s.present}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          s.percentage >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {s.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex justify-center items-center py-20 text-zinc-400">
                No students found.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
