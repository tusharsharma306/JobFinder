//JobCard.jsx
import { GoLocation } from "react-icons/go";
import moment from "moment";
import { Link } from "react-router-dom";
import { stripHtml } from '../utils';

const JobCard = ({ job, showStatus = false, showArchiveToggle, onArchiveToggle, isArchived }) => {
  const isExpired = new Date(job?.deadline) < new Date();
  const applicationsCount = job?.applications?.length || 0;

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-5 flex flex-col gap-3 relative">
      <Link to={`/job-detail/${job._id}`} className="block group" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className='flex gap-3'>
          <img
            src={job?.logo}
            alt={job?.name}
            className='w-14 h-14 rounded'
          />
          <div className='w-full h-16 flex flex-col justify-center'>
            <p className='text-lg font-semibold truncate'>{job?.jobTitle}</p>
            <span className='text-gray-500 text-sm'>{job?.location}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Deadline: {new Date(job?.deadline).toLocaleDateString()}
        </p>
        <div className='py-3'>
          <p className='text-sm text-gray-500'>
            {job?.detail?.[0]?.desc 
              ? stripHtml(job.detail[0].desc).slice(0, 150) + "..."
              : "No description available"}
          </p>
        </div>
        <div className='flex items-center justify-between'>
          <p className='bg-blue-100 px-2 py-1 rounded text-blue-600 text-sm'>
            {job?.jobType}
          </p>
          <span className='text-gray-500 text-sm'>
            {moment(job?.createdAt).fromNow()}
          </span>
        </div>


        {showStatus ? (
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(job?.status)}`}>
              {job?.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Pending'}
            </span>
          </div>
        ) : isExpired ? (
          <div className="absolute top-2 right-2">
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Expired</span>
          </div>
        ) : typeof isArchived !== 'undefined' ? (
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs rounded ${isArchived ? 'bg-gray-400 text-white' : 'bg-green-400 text-white'}`}>
              {isArchived ? 'Archived' : 'Active'}
            </span>
          </div>
        ) : null}
      </Link>
      {showArchiveToggle && (
        <button
          className={`mt-2 px-3 py-1 rounded ${isArchived ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
          onClick={onArchiveToggle}
        >
          {isArchived ? 'Unarchive' : 'Archive'}
        </button>
      )}
    </div>
  );
};

export default JobCard;


