//CompanyProfile.jsx
import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { HiLocationMarker } from "react-icons/hi";
import { AiOutlineMail } from "react-icons/ai";
import { FiPhoneCall, FiEdit3, FiUpload } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { CustomButton, JobCard, Loading, TextInput } from "../components";
import { apiRequest, handleFileUpload } from "../utils";
import { Login } from "../redux/userSlice";

const CompnayForm = ({ open, setOpen }) => {
  const { user } = useSelector((state) => state.user);
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: { ...user },
  });

  const dispatch = useDispatch();
  const [profileImage, setProfileImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg,setErrMsg] = useState({status : false,message:""});
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrMsg(null);

    const uri = profileImage && (await handleFileUpload(profileImage));

    const newData = uri ? {...data,profileUrl:uri}: data;
    
    try{
      const res = await apiRequest({
        url: "/companies/update-company",
        token: user?.token,
        data: newData,
        method: "PUT",
      })
      setIsLoading(false);
      // console.log(newData);
      // console.log(res);

      if(res.status === "failed"){
        setErrMsg({...res});
      }
      else{
        setErrMsg({status: "success",message:res.message});
        const newData = {token : res?.token, ...res?.user};
        dispatch(Login(newData));
        localStorage.setItem("userInfo",JSON.stringify(data));

        setTimeout(() =>{
          window.location.reload();
        },1500);
      }
    } catch (error){

      console.error("Error updating company profile:", error);
    setIsLoading(false);
    setErrMsg({ status: true, message: "Failed to update company profile" });
    }
  };

  const closeModal = () => setOpen(false);

  return (
    <>
      <Transition appear show={open ?? false} as={Fragment}>
        <Dialog as='div' className='relative z-50' onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-semibold leading-6 text-gray-900'
                  >
                    Edit Company Profile
                  </Dialog.Title>

                  <form
                    className='w-full mt-2 flex flex-col gap-5'
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <TextInput
                      name='name'
                      label='Company Name'
                      type='text'
                      register={register("name", {
                        required: "Compnay Name is required",
                      })}
                      error={errors.name ? errors.name?.message : ""}
                    />

                    <TextInput
                      name='location'
                      label='Location/Address'
                      placeholder='eg. Bengaluru'
                      type='text'
                      register={register("location", {
                        required: "Address is required",
                      })}
                      error={errors.location ? errors.location?.message : ""}
                    />

                    <div className='w-full flex gap-2'>
                      <div className='w-1/2'>
                        <TextInput
                          name='contact'
                          label='Contact'
                          placeholder='Phone Number'
                          type='text'
                          register={register("contact", {
                            required: "Contact is required!",
                          })}
                          error={errors.contact ? errors.contact?.message : ""}
                        />
                      </div>

                      <div className='w-1/2 mt-2'>
                        <label className='text-gray-600 text-sm mb-1'>
                          Company Logo
                        </label>
                        <input
                          type='file'
                          onChange={(e) => setProfileImage(e.target.files[0])}
                        />
                      </div>
                    </div>

                    <div className='flex flex-col'>
                      <label className='text-gray-600 text-sm mb-1'>
                        About Company
                      </label>
                      <textarea
                        className='ounded border border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base px-4 py-2 resize-none'
                        rows={4}
                        cols={6}
                        {...register("about", {
                          required: "Write a little bit about your company.",
                        })}
                        aria-invalid={errors.about ? "true" : "false"}
                      ></textarea>
                      {errors.about && (
                        <span
                          role='alert'
                          className='text-xs text-red-500 mt-0.5'
                        >
                          {errors.about?.message}
                        </span>
                      )}
                    </div>

                    <div className='mt-4'>
                      {
                        isLoading ? (
                          <Loading/>
                        ):(
                        <CustomButton
                        type='submit'
                        containerStyles='inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-8 py-2 text-sm font-medium text-white hover:bg-[#1d4fd846] hover:text-[#1d4fd8] focus:outline-none '
                        title={"Submit"}
                      />
                      )}
                       
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

const CompanyProfile = () => {
  const params = useParams();
  const { user } = useSelector((state) => state.user);
  const [info, setInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [tab, setTab] = useState("active");
  const [jobs, setJobs] = useState([]);

  const fetchCompany = async() => {
    setIsLoading(true);
    let id = null;

    if(params?.id) {
      id = params.id;
    } else if(user?._id) {
      id = user._id;
    }

    if(id) {
      try {
        const res = await apiRequest({
          url: `/companies/get-company/${id}`,
          method: "GET",
          token: user?.token 
        });

        setInfo(res?.data);
      } catch(error) {
        console.log(error);
      }
    }
    setIsLoading(false);
  };

  const fetchJobs = async (archived = false) => {
    try {

      const archivedBool = Boolean(archived);
      
      const res = await apiRequest({
        url: "/companies/get-company-joblisting",
        method: "POST",
        token: user?.token,
        data: { archived: archivedBool }
      });
      console.log('[CompanyProfile] API response for jobs:', res);
      if (res.success) setJobs(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if(user?._id || params?.id) {
      fetchCompany();
    }
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [user, params?.id]);

  useEffect(() => {
    fetchJobs(tab === "archived");
  }, [tab]);


  const handleArchiveToggle = async (jobId, isArchived) => {
    try {
      const url = isArchived ? `/jobs/unarchive-job/${jobId}` : `/jobs/archive-job/${jobId}`;
      const res = await apiRequest({ 
        url, 
        method: "PUT", 
        token: user?.token 
      });
      if (res.success) fetchJobs(tab === "archived");
    } catch (e) { console.error(e); }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className='container mx-auto p-5'>
      <div className=''>
        <div className='w-full flex flex-col md:flex-row gap-3 justify-between items-center'>
          <h2 className='text-gray-600 text-xl font-semibold'>
            Welcome, {info?.name}
          </h2>

          {user?.accountType === "company" &&
            info?._id === user?._id && (
              <div className='flex items-center justify-center py-5 md:py-0 gap-4'>
                <CustomButton
                  onClick={() => setOpenForm(true)}
                  iconRight={<FiEdit3 />}
                  containerStyles={`py-1.5 px-3 md:px-5 focus:outline-none bg-blue-600  hover:bg-blue-700 text-white rounded text-sm md:text-base border border-blue-600`}
                />

                <Link to='/upload-job'>
                  <CustomButton
                    title='Upload Job'
                    iconRight={<FiUpload />}
                    containerStyles={`text-blue-600 py-1.5 px-3 md:px-5 focus:outline-none  rounded text-sm md:text-base border border-blue-600`}
                  />
                </Link>
              </div>
            )}
        </div>

        <div className='w-full flex flex-col md:flex-row justify-start md:justify-between mt-4 md:mt-8 text-sm'>
          <p className='flex gap-1 items-center   px-3 py-1 text-slate-600 rounded-full'>
            <HiLocationMarker /> {info?.location ?? "No Location"}
          </p>
          <p className='flex gap-1 items-center   px-3 py-1 text-slate-600 rounded-full'>
            <AiOutlineMail /> {info?.email ?? "No Email"}
          </p>
          <p className='flex gap-1 items-center   px-3 py-1 text-slate-600 rounded-full'>
            <FiPhoneCall /> {info?.contact ?? "No Contact"}
          </p>

          <div className='flex flex-col items-center mt-10 md:mt-0'>
            <span className='text-xl'>{info?.jobPosts?.length}</span>
            <p className='text-blue-600 '>Job Post</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button className={`px-4 py-2 rounded ${tab === "active" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setTab("active")}>Active Jobs</button>
        <button className={`px-4 py-2 rounded ${tab === "archived" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setTab("archived")}>Archived Jobs</button>
      </div>

      <div className='w-full mt-20 flex flex-col gap-2'>
        <p>Jobs Posted</p>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {jobs.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">No jobs found in this section.</div>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                showArchiveToggle
                onArchiveToggle={() => handleArchiveToggle(job._id, job.isArchived)}
                isArchived={job.isArchived}
              />
            ))
          )}
        </div>
      </div>


      <CompnayForm open={openForm} setOpen={setOpenForm} />
    </div>
  );
};

export default CompanyProfile;