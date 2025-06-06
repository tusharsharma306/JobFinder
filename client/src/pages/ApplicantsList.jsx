//ApplicantsList.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiRequest } from '../utils';

const ApplicantsList = ({ jobId }) => {
  const { user } = useSelector((state) => state.user);
  const [applicants, setApplicants] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    skills: '',
    status: '',
    sortBy: 'date',
    order: 'desc'
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });

  const filterApplicantsBySkill = (applicants, skillQuery) => {
    if (!skillQuery) return applicants;
    
    return applicants.filter(applicant => 
      applicant.user.skills?.some(skill => 
        skill.toLowerCase().includes(skillQuery.toLowerCase())
      )
    );
  };

  const fetchApplicants = async () => {
    try {
      const queryString = new URLSearchParams({
        ...filters,
        skills: filters.skills.toLowerCase()
      }).toString();
      
      const res = await apiRequest({
        url: `/jobs/applicants/${jobId}?${queryString}`,
        token: user?.token,
        method: 'GET'
      });
      
      if (res.success) {
        setApplicants(res.data);
        updateStats(res.data);
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  const updateStats = (data) => {
    const stats = data.reduce((acc, curr) => {
      acc.total++;
      acc[curr.status]++;
      return acc;
    }, { total: 0, pending: 0, accepted: 0, rejected: 0 });
    setStats(stats);
  };

  const updateApplicantStatus = async (applicantId, newStatus) => {
    try {
      const res = await apiRequest({
        url: '/jobs/update-application-status',
        method: 'PUT',
        data: {
          jobId,
          userId: applicantId,
          status: newStatus
        },
        token: user?.token
      });

      if (res.success) {
        fetchApplicants(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleSort = (type) => {
    setFilters({
      ...filters,
      sortBy: type,
      order: filters.order === 'desc' ? 'asc' : 'desc'
    });
  };

  useEffect(() => {
    fetchApplicants();
  }, [filters]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Application Statistics</h2>
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total" count={stats.total} color="bg-gray-100" />
          <StatCard title="Pending" count={stats.pending} color="bg-yellow-100" />
          <StatCard title="Accepted" count={stats.accepted} color="bg-green-100" />
          <StatCard title="Rejected" count={stats.rejected} color="bg-red-100" />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by skills..."
          value={filters.skills}
          onChange={(e) => setFilters({...filters, skills: e.target.value})}
          className="border p-2 rounded flex-1"
        />
        <input
          type="text"
          placeholder="Search applicants..."
          className="border p-2 rounded flex-1"
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />
        <select 
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          className="border p-2 rounded w-32"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={() => handleSort('date')}
          className="border p-2 rounded bg-gray-50"
        >
          Sort by Date {filters.sortBy === 'date' && (filters.order === 'desc' ? '↓' : '↑')}
        </button>
      </div>

      <div className="grid gap-4">
        {applicants.map((applicant) => (
          <ApplicantCard 
            key={applicant._id || `${applicant.user._id}-${applicant.appliedDate}`}
            applicant={applicant}
            onStatusUpdate={updateApplicantStatus}
          />
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ title, count, color }) => (
  <div className={`${color} p-4 rounded-lg text-center`}>
    <h3 className="font-semibold">{title}</h3>
    <p className="text-2xl">{count}</p>
  </div>
);

const ApplicantCard = ({ applicant, onStatusUpdate }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  // Get the resume URL from either source
  const resumeUrl = applicant.resumeUrl || applicant.user?.cvUrl;

  return (
    <div className="border p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">
            {applicant.user.firstName} {applicant.user.lastName}
          </h3>
          <p className="text-gray-600">{applicant.user.email}</p>
          {applicant.user.jobTitle && (
            <p className="text-gray-500">{applicant.user.jobTitle}</p>
          )}
        </div>
        
        <div className="text-right">
          <select
            value={applicant.status}
            onChange={(e) => onStatusUpdate(applicant.user._id, e.target.value)}
            className={`border p-2 rounded ${statusColors[applicant.status]}`}
          >
            <option value="pending">Pending</option>
            <option value="accepted">Accept</option>
            <option value="rejected">Reject</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Applied: {new Date(applicant.appliedDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {applicant.user.skills?.map((skill, index) => (
          <span 
            key={`${applicant.user._id}-${skill}-${index}`}
            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>

      {resumeUrl && (
        <div className="mt-4 flex justify-end">
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            View Resume
          </a>
        </div>
      )}
    </div>
  );
};

export default ApplicantsList;