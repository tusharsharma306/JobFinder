import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { CustomButton, JobCard, JobTypes, TextInput, Loading } from "../components";
import { apiRequest } from "../utils";
import QuillEditor from '../components/QuillEditor';

const UploadJob = () => {
  const { user } = useSelector((state) => state.user);
  const [jobType, setJobType] = useState("Full-Time");
  const [recentPost, setRecentPost] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrMsg("");

    try {
      const newJob = {
        ...data,
        jobType: jobType,
        detail: {
          ...data,
        }
      };

      const res = await apiRequest({
        url: "/jobs/upload-job",
        token: user?.token,
        data: newJob,
        method: "POST",
      });

      if (res.success) {
        setIsLoading(false);
        setErrMsg("");
        window.location.reload();
      } else {
        setIsLoading(false);
        setErrMsg(res?.message);
      }
    } catch (error) {
      setIsLoading(false);
      setErrMsg(error?.message);
    }
  };

  const getRecentPost = async () => {
    try {
      if (!user?._id) {
        console.log("No user ID found");
        return;
      }

      const res = await apiRequest({
        url: `/companies/get-company-joblisting`,
        token: user?.token,
        method: "POST", // Change to POST since we're sending user data
      });

      if (res?.success) {
        setRecentPost(res?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getRecentPost();
  }, []);

  return (
    <div className='container mx-auto flex flex-col md:flex-row gap-8 2xl:gap-14 bg-[#f7fdfd] px-5'>
      <div className='w-full h-fit md:w-2/3 2xl:w-2/4 bg-white px-5 py-10 md:px-10 shadow-md'>
        <div>
          <p className='text-gray-500 font-semibold text-2xl'>Job Post</p>

          <form
            className='w-full mt-2 flex flex-col gap-8'
            onSubmit={handleSubmit(onSubmit)}
          >
            <TextInput
              name='jobTitle'
              label='Job Title'
              placeholder='eg. Software Engineer'
              type='text'
              required={true}
              register={register("jobTitle", {
                required: "Job Title is required",
              })}
              error={errors.jobTitle ? errors.jobTitle?.message : ""}
            />

            <div className='w-full flex gap-4'>
              <div className={`w-1/2 mt-2`}>
                <label className='text-gray-600 text-sm mb-1'>Job Type</label>
                <JobTypes jobTitle={jobType} setJobTitle={setJobType} />
              </div>

              <div className='w-1/2'>
                <TextInput
                  name='salary'
                  label='Salary'
                  placeholder='eg. 1500'
                  type='number'
                  register={register("salary", {
                    required: "Salary is required",
                  })}
                  error={errors.salary ? errors.salary?.message : ""}
                />
              </div>
            </div>

            <div className='w-full flex gap-4'>
              <div className='w-1/2'>
                <TextInput
                  name='vacancies'
                  label='No. of Vacancies'
                  placeholder='vacancies'
                  type='number'
                  register={register("vacancies", {
                    required: "Vacancies is required!",
                  })}
                  error={errors.vacancies ? errors.vacancies?.message : ""}
                />
              </div>

              <div className='w-1/2'>
                <TextInput
                  name='experience'
                  label='Years of Experience'
                  placeholder='experience'
                  type='number'
                  register={register("experience", {
                    required: "Experience is required",
                  })}
                  error={errors.experience ? errors.experience?.message : ""}
                />
              </div>
            </div>

            <TextInput
              name='location'
              label='Job Location'
              placeholder='eg. New York'
              type='text'
              register={register("location", {
                required: "Location is required",
              })}
              error={errors.location ? errors.location?.message : ""}
            />
            
            <div className='flex flex-col'>
              <label className='text-gray-600 text-sm mb-1'>
                Job Description
              </label>
              <Controller
                name="desc"
                control={control}
                defaultValue=""
                rules={{ required: "Job Description is required!" }}
                render={({ field }) => (
                  <QuillEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter job description..."
                  />
                )}
              />
              {errors.desc && (
                <span role='alert' className='text-xs text-red-500 mt-0.5'>
                  {errors.desc?.message}
                </span>
              )}
            </div>

              
              <TextInput
                name='deadline'
                label='Deadline'
                placeholder='eg. 2023-12-31'
                type='date'
                register={register("deadline", {
                  required: "Deadline is required",
                })}
                error={errors.deadline ? errors.deadline?.message : ""}
              />


            <div className='flex flex-col'>
              <label className='text-gray-600 text-sm mb-1'>
                Requirements
              </label>
              <Controller
                name="requirements"
                control={control}
                defaultValue=""
                rules={{ required: "Requirements are required!" }}
                render={({ field }) => (
                  <QuillEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter requirements..."
                  />
                )}
              />
              {errors.requirements && (
                <span role='alert' className='text-xs text-red-500 mt-0.5'>
                  {errors.requirements?.message}
                </span>
              )}
            </div>

            {errMsg && (
              <span role='alert' className='text-sm text-red-500 mt-0.5'>
                {errMsg}
              </span>
            )}

            <div className='mt-2'>
              {isLoading ? (
                <Loading />
              ) : (
                <CustomButton
                  type='submit'
                  containerStyles='inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-8 py-2 text-sm font-medium text-white hover:bg-[#1d4fd846] hover:text-[#1d4fd8] focus:outline-none'
                  title='Submit'
                />
              )}
            </div>
          </form>
        </div>
      </div>
      
      <div className='w-full md:w-1/3 2xl:w-2/4 p-5 mt-20 md:mt-0'>
        <p className='text-gray-500 font-semibold'>Recent Job Post</p>

        <div className='w-full flex flex-wrap gap-6'>
          {recentPost?.slice(0, 4).map((job, index) => {
            const data = {
              name: user?.name,
              email: user?.email,
              logo: user?.profileUrl,
              ...job,
            };
            return <JobCard job={data} key={index} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default UploadJob;