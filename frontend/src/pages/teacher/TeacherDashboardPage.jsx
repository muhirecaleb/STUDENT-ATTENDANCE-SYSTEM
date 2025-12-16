import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import { Captions, GraduationCap, Loader, School } from "lucide-react";
import  useTeacherStore from "../../store/teacherStore.js";

const TeacherDashboardPage = () => {
  const [counts, setCounts] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalSubjects: 0,
  });

  const { getTeacherOverview , isLoading } = useTeacherStore();

  useEffect(() => {
    const fetchData = async () => {
      const {count} = await getTeacherOverview();

      console.log(count)
      setCounts({
        totalClasses: count.totalClasses,
        totalStudents: count.totalStudents,
        totalSubjects: count.totalSubjects,
      });
    };

    fetchData();
  }, [getTeacherOverview]);

  return (
    <div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin text-4xl text-[#6c62ff]" />
          </div>
        ) : (
          <div className="flex gap-8 w-full items-center">
            <Card name="Total Classes" count={counts.totalClasses} icon={<School className={` text-xl text-yellow-400 `} />}  />
            <Card name="Total Students" count={counts.totalStudents} icon={<GraduationCap className={` text-xl text-blue-500 `} />}  />
            <Card name="Total Subjects" count={counts.totalSubjects}  icon={ <Captions className={` text-xl text-green-600 `} />}  />
          </div>

          
        )}
    </div>
  );
};

export default TeacherDashboardPage;
