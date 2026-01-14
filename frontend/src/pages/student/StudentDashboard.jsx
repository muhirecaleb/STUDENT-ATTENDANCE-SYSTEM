import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import DatePicker from "react-datepicker";
import { useStudentStore } from "../../store/studentStore";
import { authStore } from "../../store/authStore";
import { AgCharts } from "ag-charts-react";
import "react-datepicker/dist/react-datepicker.css";
import { GraduationCap, Loader, School, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

const StudentDashboard = () => {
  const { getMonthlyAttendance, isLoading, getOverview, isLoadingOverview } =
    useStudentStore();
  const { user } = authStore();

  const [chartOptions, setChartOptions] = useState({});
  const [options, setOptions] = useState({});
  const [startDate, setStartDate] = useState(new Date());
  const [overview, setOverview] = useState({
    totalSubjects: 0,
    totalDays: 0,
    presentDays: 0,
    attendancePercentage: 0,
    className: "N/A",
  });

  const fetchData = async (year) => {
    if (!user?._id) return;
    const response = await getMonthlyAttendance(user._id, year);
    if (response.success) {
      if (response.monthlyAttendance.length === 0) {
        setChartOptions({});
        setOptions({});
        return;
      }

      const attendanceData = response.monthlyAttendance.map((item) => ({
        month: new Date(0, item.month - 1).toLocaleString("default", {
          month: "short",
        }),
        presentPercentage: parseFloat(item.totalPresent.replace("%", "")),
        absentPercentage: parseFloat(item.totalAbsent.replace("%", "")),
      }));

      setChartOptions({
        data: attendanceData,
        series: [
          {
            type: "bar",
            xKey: "month",
            yKey: "presentPercentage",
            yName: "Present",
            fill: "#6c62ff",
            stacked: true,
          },
          {
            type: "bar",
            xKey: "month",
            yKey: "absentPercentage",
            yName: "Absent",
            fill: "oklch(44.4% 0.177 26.899)",
            stacked: true,
          },
        ],
        animation: {
          enabled: true,
          duration: 1700,
        },
      });

      const { overall } = response;

      setOptions({
        data: [
          { category: "Present", value: overall.totalPresentPercentage },
          {
            category: "Absent",
            value: overall.totalAbsentPercentage,
            fill: "oklch(44.4% 0.177 26.899)",
          },
        ],
        series: [
          {
            type: "pie",
            angleKey: "value",
            labelKey: "category",
            title: { text: "Overall Attendance Distribution" },
            fills: ["#6c62ff", "oklch(44.4% 0.177 26.899)"],
          },
        ],
        animation: {
          enabled: true,
          duration: 1700,
          easing: "easeInOutQuad",
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
  }, [startDate, user]);

  useEffect(() => {
    const fetchOverview = async () => {
      if (!user?._id) return;
      const response = await getOverview(user._id);
      if (response.success) {
        setOverview(response.overview);
      } else {
        toast.error(response.message);
      }
    };

    fetchOverview();
  }, [user]);

  const INPUT_STYLE =
    "p-2 bg-gray-100 text-gray-700 rounded-md border-2 border-[#6c62ff] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto transition duration-150";

  return isLoadingOverview ? (
    <div className="w-full h-[400px] flex items-center justify-center">
      <Loader className="animate-spin text-[#6c62ff]" />
    </div>
  ) : (
    <div className="p-4 md:p-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full mb-6">
        <Card
          name="Class"
          count={overview.className}
          icon={<School className="text-xl text-yellow-400" />}
        />
        <Card
          name="Total Subjects"
          count={overview.totalSubjects}
          icon={<GraduationCap className="text-xl text-blue-500" />}
        />
        <Card
          name="Present Days"
          count={overview.presentDays}
          icon={<TrendingUp className="text-xl text-green-600" />}
        />
        <Card
          name="Attendance %"
          count={`${overview.attendancePercentage}%`}
          icon={<TrendingUp className="text-xl text-purple-600" />}
        />
      </div>

      {/* Title and Date Picker Section */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold flex-1">
          Your attendance for the year {startDate.getFullYear()}
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

      {/* Charts Section */}
      <div className="mt-8">
        {isLoading ? (
          <div className="w-full h-[400px] flex items-center justify-center">
            <Loader className="animate-spin text-[#6c62ff]" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
            {/* Bar Chart */}
            <div className="w-full lg:w-2/3 h-64 sm:h-80 md:h-96">
              <AgCharts
                className="h-full w-full border-2 rounded-lg"
                options={chartOptions}
              />
            </div>

            {/* Pie Chart */}
            <div className="w-full lg:w-1/3 h-64 sm:h-80 md:h-96">
              <AgCharts
                className="h-full w-full border-2 rounded-lg"
                options={options}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
