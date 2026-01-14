import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import Card from "../../components/Card";
import TeacherHeader from "../../components/TeacherHeader";
import { Captions, GraduationCap, Loader, School, Users, ListChecks, Calendar, BookOpen, ArrowRight } from "lucide-react";
import useTeacherStore from "../../store/teacherStore.js";

const TeacherDashboardPage = () => {
  const [counts, setCounts] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalSubjects: 0,
  });

  const { getTeacherOverview, isLoading } = useTeacherStore();

  useEffect(() => {
    const fetchData = async () => {
      const { count } = await getTeacherOverview();

      console.log(count);
      setCounts({
        totalClasses: count.totalClasses,
        totalStudents: count.totalStudents,
        totalSubjects: count.totalSubjects,
      });
    };

    fetchData();
  }, [getTeacherOverview]);

  const quickActions = [
    {
      title: "Take Attendance",
      description: "Mark student attendance for your classes",
      icon: <ListChecks className="w-8 h-8 text-blue-500" />,
      link: "/teacher/attendance",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    },
    {
      title: "View Students",
      description: "See all students in your classes",
      icon: <Users className="w-8 h-8 text-green-500" />,
      link: "/teacher/students",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
    },
    {
      title: "Manage Classes",
      description: "View and manage your assigned classes",
      icon: <School className="w-8 h-8 text-purple-500" />,
      link: "/teacher/classes",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    },
    {
      title: "View Timetable",
      description: "Check your teaching schedule",
      icon: <Calendar className="w-8 h-8 text-orange-500" />,
      link: "/timetable",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <TeacherHeader name="Dashboard" />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-4xl text-[#6c62ff]" />
        </div>
      ) : (
        <>
        

          {/* Stats Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card
              name="Total Classes"
              count={counts.totalClasses}
              icon={<School className="text-xl text-yellow-400" />}
            />
            <Card
              name="Total Students"
              count={counts.totalStudents}
              icon={<GraduationCap className="text-xl text-blue-500" />}
            />
            <Card
              name="Total Subjects"
              count={counts.totalSubjects}
              icon={<Captions className="text-xl text-green-600" />}
            />
          </div>

          {/* Quick Actions Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className={`block p-6 rounded-lg border-2 transition-all duration-200 ${action.color} group`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {action.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900">
                          {action.title}
                        </h4>
                        <p className="text-sm text-gray-600 group-hover:text-gray-700">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </>
      )}
    </div>
  );
};

export default TeacherDashboardPage;
