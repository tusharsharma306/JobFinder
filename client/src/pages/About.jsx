import React from "react";
import { JobImg } from "../assets";

const About = () => {
  return (
    <div className='container mx-auto flex flex-col gap-8 2xl:gap-14 py-6 '>
      <div className='w-full flex flex-col-reverse md:flex-row gap-10 items-center p-5'>
        <div className='w-full md:2/3 2xl:w-2/4'>
          <h1 className='text-3xl text-blue-600 font-bold mb-5'>About Us</h1>
          <p className='text-justify leading-7'>
            Welcome to JobFinder! This project is a platform where companies can post 
            job opportunities and users can apply to those jobs. 
            It was created as part of my academic and skill enhancement journey, 
            and serves as a learning tool to improve my understanding of web development and application design.
          </p>
        </div>
        <img src={JobImg} alt='About' className='w-auto h-[300px]' />
      </div>

      <div className='leading-8 px-5 text-justify'>
        <p>
          JobFinder is designed to help users find job opportunities that
           suit their skills and interests, while also providing companies with a 
           simple way to post and manage job listings. This platform is a hands-on 
           project aimed at enhancing my coding skills, understanding of full-stack development, 
           and learning the intricacies of building a web application from scratch.
        </p>
        <p>
          Please explore the features, try applying for some jobs, 
          or if you're an employer, feel free to post a job listing. 
          Keep in mind that this is a learning project, 
          so while the core functionalities are in place, there may be some areas that need refinement.
           I appreciate your understanding and hope you find JobFinder useful!
        </p>
      </div>
    </div>
  );
};

export default About;
