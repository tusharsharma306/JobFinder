//JobDetail.jsx
import { useEffect, useState } from "react";
import moment from "moment";
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { useParams, useNavigate } from "react-router-dom";
import { CustomButton, JobCard, Loading } from "../components";
import { useSelector } from "react-redux";
import { apiRequest } from "../utils";
import ApplicantsList from "./ApplicantsList";
import { toast } from "react-toastify";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [selected, setSelected] = useState("0");
  const [isFetching, setIsFetching] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [showApplicants, setShowApplicants] = useState(false);

  const handleApply = async () => {
    if (!user?.token) {
      navigate("/user-auth");
      return;
    }

    if (!user?.cvUrl) {
      alert("Please upload your resume in your profile before applying");
      return;
    }

    try {
      const res = await apiRequest({
        url: `/jobs/apply-jobs/${job?._id}`,
        token: user?.token,
        method: "POST",
        data: { cvUrl: user.cvUrl },
      });

      if (res?.success) {
        setIsApplied(true);
        toast.success(res?.message);
      } else {
        toast.error(res?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getJobDetails = async () => {
    setIsFetching(true);

    try {
      const res = await apiRequest({
        url: "/jobs/get-job-detail/" + id,
        method: "GET",
      });
      setJob(res?.data);
      setSimilarJobs(res?.similarJobs);
      setIsFetching(false);
    } catch (error) {
      setIsFetching(false);
      console.log(error);
    }
  };

  const handleDeletePost = async () => {
    setIsFetching(true);
    try {
      if (window.confirm("Delete Job Post?")) {
        const res = await apiRequest({
          url: "/jobs/delete-job/" + job?._id,
          token: user?.token,
          method: "DELETE",
        });

        if (res?.success) {
          alert(res?.message);
          window.location.replace("/");
        }
      }
      setIsFetching(false);
    } catch (error) {
      setIsFetching(false);
      console.log(error);
    }
  };

  const handleEdit = () => {
    setEditForm({
      jobTitle: job.jobTitle,
      jobType: job.jobType,
      location: job.location,
      salary: job.salary,
      vacancies: job.vacancies,
      experience: job.experience,
      desc: job.detail[0].desc,
      requirements: job.detail[0].requirements,
      deadline: job.deadline,
      skills: job.skills,
    });
    setIsEditing(true);
  };

  const handleUpdate = async (formData) => {
    try {
      const res = await apiRequest({
        url: `/jobs/update-job/${job._id}`,
        method: "PUT",
        data: formData,
        token: user?.token,
      });

      if (res.success) {
        setIsEditing(false);
        getJobDetails(); // Refresh job details
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    id && getJobDetails();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [id]);

  return (
    <div className='container mx-auto'>
      {isEditing ? (
        <JobEditForm
          initialData={editForm}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className='w-full flex flex-col md:flex-row gap-10'>
          {/* LEFT SIDE */}
          {isFetching ? (
            <Loading />
          ) : (
            <div className='w-full md:w-2/3 2xl:w-2/4 bg-white px-5 py-10 md:px-10 shadow-md'>
              <div className='w-full flex items-center justify-between'>
                <div className='w-3/4 flex gap-2'>
                  <img
                    src={job?.company?.profileUrl}
                    alt={job?.company?.name}
                    className='w-20 h-20 md:w-24 md:h-20 rounded'
                  />

                  <div className='flex flex-col'>
                    <p className='text-xl font-semibold text-gray-600'>
                      {job?.jobTitle}
                    </p>

                    <span className='text-base'>{job?.location}</span>

                    <span className='text-base text-blue-600'>
                      {job?.company?.name}
                    </span>

                    <span className='text-gray-500 text-sm'>
                      {moment(job?.createdAt).fromNow()}
                    </span>
                  </div>
                </div>

                <div className=''>
                  <AiOutlineSafetyCertificate className='text-3xl text-blue-500' />
                </div>
              </div>

              <div className='w-full flex flex-wrap md:flex-row gap-2 items-center justify-between my-10'>
                <div className='bg-[#bdf4c8] w-40 h-16 rounded-lg flex flex-col items-center justify-center'>
                  <span className='text-sm'>Salary</span>
                  <p className='text-lg font-semibold text-gray-700'>
                    $ {job?.salary}
                  </p>
                </div>

                <div className='bg-[#bae5f4] w-40 h-16 rounded-lg flex flex-col items-center justify-center'>
                  <span className='text-sm'>Job Type</span>
                  <p className='text-lg font-semibold text-gray-700'>
                    {job?.jobType}
                  </p>
                </div>

                <div className='bg-[#fed0ab] w-40 h-16 px-6 rounded-lg flex flex-col items-center justify-center'>
                  <span className='text-sm'>No. of Applicants</span>
                  <p className='text-lg font-semibold text-gray-700'>
                    {job?.application?.length}
                  </p>
                </div>

                <div className='bg-[#cecdff] w-40 h-16 px-6 rounded-lg flex flex-col items-center justify-center'>
                  <span className='text-sm'>No. of Vacancies</span>
                  <p className='text-lg font-semibold text-gray-700'>
                    {job?.vacancies}
                  </p>
                </div>

                <div className='bg-[#ffcdff] w-40 h-16 px-6 rounded-lg flex flex-col items-center justify-center'>
                  <span className='text-sm'>Yr. of Experience</span>
                  <p className='text-lg font-semibold text-gray-700'>
                    {job?.experience}
                  </p>
                </div>
              </div>

              {/* Job Description */}
              <div className='w-full flex gap-4 py-5'>
                <div className='w-full'>
                  <p className='text-xl font-semibold'>Job Description</p>
                  <span className='text-base'>{job?.detail[0]?.desc}</span>

                  {job?.detail[0]?.requirements && (
                    <>
                      <p className='text-xl font-semibold mt-8'>Requirements</p>
                      <span className='text-base'>
                        {job?.detail[0]?.requirements}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Application Button */}
              <div className='w-full'>
                {job?.company?._id === user?._id ? (
                  // Company's view
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <CustomButton
                        title='Edit Job'
                        onClick={handleEdit}
                        containerStyles={`bg-blue-600 text-white px-4 py-2 rounded`}
                      />
                      <CustomButton
                        title='Delete Job'
                        onClick={handleDeletePost}
                        containerStyles={`bg-red-600 text-white px-4 py-2 rounded`}
                      />
                    </div>
                    
                    <div>
                      <CustomButton
                        title={`View Applicants (${job?.applications?.length || 0})`}
                        onClick={() => setShowApplicants(!showApplicants)}
                        containerStyles={`w-full bg-green-600 text-white px-4 py-2 rounded`}
                      />
                      
                      {showApplicants && (
                        <div className="mt-4">
                          <ApplicantsList jobId={job._id} />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Job seeker's view
                  <CustomButton
                    title={isApplied ? "Applied" : "Apply Now"}
                    onClick={handleApply}
                    containerStyles={`w-full flex items-center justify-center text-white ${
                      isApplied ? "bg-gray-500" : "bg-blue-600"
                    } py-3 px-5 outline-none rounded-full text-base`}
                  />
                )}
              </div>
            </div>
          )}

          {/* RIGHT SIDE */}
          <div className='w-full md:w-1/3 2xl:w-2/4 p-5 mt-20 md:mt-0'>
            <p className='text-gray-500 font-semibold'>Similar Job Posts</p>

            <div className='w-full flex flex-wrap gap-4'>
              {similarJobs?.slice(0, 6).map((job, index) => {
                const data = {
                  name: job?.company?.name,
                  logo: job?.company?.profileUrl,
                  ...job,
                };
                return <JobCard job={data} key={index} />;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;