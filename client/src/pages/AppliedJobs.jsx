import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { JobCard, Loading } from '../components';
import { apiRequest } from '../utils';

const AppliedJobs = () => {
  const { user } = useSelector((state) => state.user);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const res = await apiRequest({
          url: '/users/applied-jobs',
          token: user?.token,
          method: 'GET'
        });

        if (res.success) {
          // Ensure all jobs have the required fields
          const formattedJobs = res.data.map(job => ({
            ...job,
            detail: job.detail || [{ desc: "No description available" }],
            status: job.status || "pending"
          }));
          setJobs(formattedJobs);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Applied Jobs</h1>
      
      {jobs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">You haven't applied to any jobs yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard 
              key={job._id} 
              job={job}
              showStatus={true} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppliedJobs;