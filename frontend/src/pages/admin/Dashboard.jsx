import React, { use, useEffect, useState } from "react";
import Card from "../../components/Card";
import DatePicker from "react-datepicker";
import { useAppStore } from "../../store/adminStore";
import { AgCharts } from 'ag-charts-react';
import { LicenseManager } from "ag-charts-enterprise";
import "react-datepicker/dist/react-datepicker.css";
import { Captions, GraduationCap, GraduationCapIcon, Loader, School, Users } from "lucide-react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { getMonthlyAttendance, isLoading , getCounts  , isLoadingAttendance} = useAppStore();

  const [chartOptions, setChartOptions] = useState({});
  const [options, setOptions] = useState({});
  const [startDate, setStartDate] = useState(new Date());
  const [counts, setCounts] = useState({
    classes: 0,
    students: 0,
    teachers: 0,
    subjects: 0,
  });

  const fetchData = async (year) => {
    const response = await getMonthlyAttendance(year);
    if (response.success) {

      if(response.monthlyAttendance.length === 0){
        setChartOptions({});
        setOptions({});
        return;
      }

      const attendanceData = response.monthlyAttendance.map(item => ({
        month: new Date(0, item.month - 1).toLocaleString('default', { month: 'short' }),
        presentPercentage: parseFloat(item.totalPresent.replace('%', '')),
        absentPercentage: parseFloat(item.totalAbsent.replace('%', '')),
      }));

  setChartOptions({
  data: attendanceData,
  series: [
    { type: 'bar', xKey: 'month', yKey: 'presentPercentage', yName: 'Present', fill: '#6c62ff' },
    { type: 'bar', xKey: 'month', yKey: 'absentPercentage', yName: 'Absent', fill: 'oklch(44.4% 0.177 26.899)' }
  ],

  animation: {
    enabled: true,
    duration: 1700
  },
});

      const totalPresent = attendanceData.reduce((acc, item) => acc + item.presentPercentage, 0);
      const totalAbsent = attendanceData.reduce((acc, item) => acc + item.absentPercentage, 0);

      setOptions({
        data: [
          { category: 'Present', value: totalPresent },
          { category: 'Absent', value: totalAbsent , fill: 'oklch(44.4% 0.177 26.899)' },
        ],
        series: [
          { type: 'pie', angleKey: 'value', labelKey: 'category', title: { text: 'Overall Attendance Distribution' } ,  fills: ['#6c62ff', 'oklch(44.4% 0.177 26.899)'] },
        ],
      animation: {
          enabled: true,
          duration: 1700,
          easing: 'easeInOutQuad',
        },
      });
      
    } else {
  toast.error(response.message);
    }

    
  };

  const handleDateChange = (date) => {
    setStartDate(date);
  };

  useEffect(() => {
    const year = startDate.getFullYear();
    fetchData(year);
  }, [startDate]);

  useEffect(() => {
    const fetchCounts = async () => {
      const response = await getCounts();
      if (response.success) {
        setCounts(response.counts);
      } else {
        toast.error(response.message);
      }
    };

    fetchCounts();
  }, [getCounts]);

  const INPUT_STYLE = "p-2 bg-gray-100 text-gray-700 rounded-md border-2 border-[#6c62ff]  focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto transition duration-150";
return (
  isLoading ? (
    <div className="w-full h-[400px] flex items-center justify-center">
      <Loader className="animate-spin text-[#6c62ff]" />
    </div>
  ) : (
    <div>
      <div className="flex gap-8 w-full items-center">
        <Card name="Classes" count={counts.classes} icon={<School className={` text-xl text-yellow-400 `} />} />
        <Card name="Students" count={counts.students} icon={<GraduationCap className={` text-xl text-blue-500 `} />} />
        <Card name="Teachers" count={counts.teachers} icon={ <Users  className={` text-xl text-purple-600 `} />} />
        <Card name="Subjects" count={counts.subjects}  icon={ <Captions className={` text-xl text-green-600 `} />} />
      </div>

      <div className="mt-6 flex items-center gap-4">
  <h3 className="text-2xl font-semibold">
    Visual representation of attendance for the year {startDate.getFullYear()}
  </h3>
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          dateFormat="yyyy"
          showYearPicker
          className={INPUT_STYLE}
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-8 h-96 mt-8">
        {isLoadingAttendance ? (
          <div className="w-full h-[400px] flex items-center justify-center">
      <Loader className="animate-spin text-[#6c62ff]" />
          </div>
        ) : (
          <>
          <div className="w-[900px] h-full">
            <AgCharts  className="h-full border-2"  options={chartOptions} />
          </div>
            <AgCharts className="border-2" options={options} />
          </>
        )}
      </div>
    </div>
  )
);
};

export default Dashboard;
