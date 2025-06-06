import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { HiLocationMarker } from "react-icons/hi";
import { AiOutlineMail } from "react-icons/ai";
import { FiPhoneCall } from "react-icons/fi";
import { CustomButton, Loading, TextInput, JobCard } from "../components";
import { NoProfile } from "../assets";
import { apiRequest, handleFileUpload } from "../utils";
import { Login } from "../redux/userSlice";

const UserForm = ({ open, setOpen }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [profileImage, setProfileImage] = useState(null);
  const [uploadCv, setUploadCv] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skills, setSkills] = useState(user?.skills || []);

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
   mode : "onChange",
   defaultValues: { ...user},
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let updatedData = {
        ...data,
        skills: JSON.stringify(skills)
      };

      // resume upload
      if (uploadCv) {
        try {
          console.log('Uploading resume...');
          const cvUrl = await handleFileUpload(uploadCv);
          console.log('Resume uploaded:', cvUrl);
          updatedData.cvUrl = cvUrl;
        } catch (error) {
          console.error('Error uploading resume:', error);
          setIsSubmitting(false);
          return;
        }
      }

      
      if (profileImage) {
        try {
          const profileUrl = await handleFileUpload(profileImage);
          updatedData.profileUrl = profileUrl;
        } catch (error) {
          console.error('Error uploading profile image:', error);
        }
      }

      console.log('Updating user with data:', updatedData);

      const res = await apiRequest({
        url: "/users/update-user",
        token: user?.token,
        method: "PUT",
        data: updatedData
      });

      if (res?.success) {
        const newData = { token: res?.token, ...res.user };
        dispatch(Login(newData));
        localStorage.setItem("userInfo", JSON.stringify(newData));
        setOpen(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Transition appear show={open ?? false} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={() => setOpen(false)}>
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
                    <div className='flex items-center justify-between'>
                      <span className='text-lg font-semibold'>Edit Profile</span>
                      {isSubmitting && <Loading />}
                      <button onClick={() => setOpen(false)} className='text-gray-500'>
                        
                      </button>
                    </div> 

                  </Dialog.Title>
                  <form
                    className='w-full mt-2 flex flex-col gap-5'
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <div className='w-full flex gap-2'>
                      <div className='w-1/2'>
                        <TextInput
                          name='firstName'
                          label='First Name'
                          placeholder='James'
                          type='text'
                          register={register("firstName", {
                            required: "First Name is required",
                          })}
                          error={
                            errors.firstName ? errors.firstName?.message : ""
                          }
                        />
                      </div>
                      <div className='w-1/2'>
                        <TextInput
                          name='lastName'
                          label='Last Name'
                          placeholder='Wagonner'
                          type='text'
                          register={register("lastName", {
                            required: "Last Name is required",
                          })}
                          error={
                            errors.lastName ? errors.lastName?.message : ""
                          }
                        />
                      </div>
                    </div>

                    <div className='w-full flex gap-2'>
                      <div className='w-1/2'>
                        <TextInput
                          name='contact'
                          label='Contact'
                          placeholder='Phone Number'
                          type='text'
                          register={register("contact", {
                            required: "Coontact is required!",
                          })}
                          error={errors.contact ? errors.contact?.message : ""}
                        />
                      </div>

                      <div className='w-1/2'>
                        <TextInput
                          name='location'
                          label='Location'
                          placeholder='Location'
                          type='text'
                          register={register("location", {
                            required: "Location is required",
                          })}
                          error={
                            errors.location ? errors.location?.message : ""
                          }
                        />
                      </div>
                    </div>

                    <TextInput
                      name='jobTitle'
                      label='Job Title'
                      placeholder='Software Engineer'
                      type='text'
                      register={register("jobTitle", {
                        required: "Job Title is required",
                      })}
                      error={errors.jobTitle ? errors.jobTitle?.message : ""}
                    />
                    <div className='w-full flex gap-2 text-sm'>
                      <div className='w-1/2'>
                        <label className='text-gray-600 text-sm mb-1'>
                          Profile Picture
                        </label>
                        <input
                          type='file'
                          onChange={(e) => setProfileImage(e.target.files[0])}
                        />
                      </div>

                      <div className='w-1/2'>
                        <label className='text-gray-600 text-sm mb-1'>
                          Resume (PDF only)
                        </label>
                        <input
                          type='file'
                          accept= '.pdf'
                          className='rounded border border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base px-4 py-2'
                          onChange={(e) => setUploadCv(e.target.files[0])}
                        />
                        {user?.cvUrl && (
                          <div className="mt-2 text-sm text-gray-600">
                            Current Resume: 
                            <a 
                              href={user.cvUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 text-blue-600 hover:underline"
                            >
                              View
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                      
                    
                    <div className='w-full'>
                      <label className='text-gray-600 text-sm mb-1'>Skills</label>
                      <div className='flex gap-2'>
                        <input
                          type='text'
                          placeholder='Add a skill and press Enter'
                          className='w-full px-3 py-2 border rounded-lg'
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const newSkill = e.target.value.trim();
                              if (newSkill && !skills.includes(newSkill)) {
                                setSkills([...skills, newSkill]);
                                e.target.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <div className='flex flex-wrap gap-2 mt-2'>
                        {skills.map((skill, index) => (
                          <span 
                            key={index}
                            className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1'
                          >
                            {skill}
                            <button
                              type='button'
                              onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                              className='text-blue-800 hover:text-blue-900'
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>


                    <div className='flex flex-col'>
                      <label className='text-gray-600 text-sm mb-1'>
                        About
                      </label>
                      <textarea
                        className='ounded border border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base px-4 py-2 resize-none'
                        rows={4}
                        cols={6}
                        {...register("about", {
                          required:
                            "Write a little bit about yourself and your projects",
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
                      <CustomButton
                        type='submit'
                        containerStyles='inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-8 py-2 text-sm font-medium text-white hover:bg-[#1d4fd846] hover:text-[#1d4fd8] focus:outline-none '
                        title={"Submit"}
                      />
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



const UserProfile = () => {
  const { user } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(user);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  

  useEffect(() => {
    if (!user?.token) return;
    const fetchUserInfo = async () => {
      setIsLoading(true);
      try {
        const res = await apiRequest({
          url: "/users/get-user",
          token: user?.token,
          method: "POST",
        });
        if (res.success) {
          setUserInfo(res?.user);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserInfo();
  }, [user]);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      setIsLoading(true);
      try {
        const res = await apiRequest({
          url: "/users/applied-jobs",
          token: user?.token,
          method: "GET",
        });
        if (res.success) {
          setAppliedJobs(res.data);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    };

    fetchAppliedJobs();
  }, [user]);

  return (  
    <div className="container mx-auto flex items-center justify-center py-10">
      <div className="w-full md:w-2/3 2xl:w-2/4 bg-white shadow-lg p-10 pb-20 rounded-lg">
        <div className="flex flex-col items-center justify-center mb-4">
          <h1 className="text-4xl font-semibold text-slate-600">
            {userInfo?.firstName + " " + userInfo?.lastName}
          </h1>
          <h5 className="text-blue-700 text-base font-bold">
            {userInfo?.jobTitle }
          </h5>
          <div className="w-full flex flex-wrap justify-between mt-8 text-sm">
            <p className="flex gap-1 items-center justify-center px-3 py-1 text-slate-600 rounded-full">
              <HiLocationMarker /> {userInfo?.location ?? "No Location"}
            </p>
            <p className="flex gap-1 items-center justify-center px-3 py-1 text-slate-600 rounded-full">
              <AiOutlineMail /> {userInfo?.email ?? "No Email"}
            </p>
            <p className="flex gap-1 items-center justify-center px-3 py-1 text-slate-600 rounded-full">
              <FiPhoneCall /> {userInfo?.contact ?? "No Contact"}
            </p>
          </div>
        </div>
        <hr />
           


        <div className="w-full py-10">
          <div className="w-full flex flex-col-reverse md:flex-row gap-8 py-6">
            <div className="w-full md:w-2/3 flex flex-col gap-4 text-lg text-slate-600">
              <p className="text-[#0536e7] font-semibold text-2xl">ABOUT</p>
              <span className="text-base text-justify leading-7">
                {userInfo?.about ?? "No About Found"}
              </span>
            </div>
            <div className="w-full md:w-1/3 h-44">
              <img
                src={userInfo?.profileUrl || NoProfile}
                alt={userInfo?.firstName}
                className="w-full h-48 object-contain rounded-lg"
              />
              <button
                className="w-full bg-blue-600 text-white mt-4 py-2 rounded"
                onClick={() => setOpen(true)}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Applied Jobs Section */}
        <div className="w-full py-10">
          <h3 className="text-[#0536e7] font-semibold text-2xl mb-6">APPLIED JOBS</h3>
          <div className="flex flex-wrap gap-4">
            {appliedJobs?.map((job, index) => (
              <JobCard job={job} key={index} showStatus={true} />
            ))}
          </div>
        </div>
      </div>


      <UserForm open={open} setOpen={setOpen} />
    </div>
  );
};

export default UserProfile;
