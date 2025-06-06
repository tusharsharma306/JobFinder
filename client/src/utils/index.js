import axios from "axios";
const API_URL = "http://localhost:8800/api-v1";


export const API = axios.create({
    baseURL:API_URL,
    responseType:"json",
});

export const apiRequest = async ({ url, token, data, method }) => {
  try {
    console.log(`Making ${method || 'GET'} request to: ${url}`);
    console.log('Request data:', data);
    console.log('Authorization token:', token);

    const result = await API(url,{
      method: method || "GET",
      data: data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    console.log('API Response:', result);
    return result?.data;
  } catch (error) {
    const err = error.response.data;
    console.log(err);
    return {status: err.success, message: err.message};
  }
};

export const handleFileUpload = async (uploadFile) => {
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("upload_preset", "jobfinder");
    
    //  upload parameters for PDFs
    if (uploadFile.type === 'application/pdf') {
        formData.append("resource_type", "raw");
    } else {
        formData.append("resource_type", "auto");
    }

    try {
        console.log('Uploading file to Cloudinary...', uploadFile.type);
        const result = await axios.post(
            uploadFile.type === 'application/pdf' 
                ? "https://api.cloudinary.com/v1_1/dao6gqgo7/raw/upload/"
                : "https://api.cloudinary.com/v1_1/dao6gqgo7/upload/",
            formData
        );
        console.log('Upload successful:', result.data.secure_url);
        return result.data.secure_url;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};


export const updateURL = ({
  pageNum,
  query,
  cmpLoc,
  sort,
  jType,
  exp,
  salary,
  skills,
  isActive,
  deadline,
  navigate,
}) => {
  const params = new URLSearchParams();

  if(pageNum && pageNum > 1){
    params.set("page", pageNum);
  }
  if(query){
    params.set("query", query);
  }
  if(cmpLoc){
    params.set("cmpLoc", cmpLoc);
  }
  if(sort){
    params.set("sort", sort);
  }
  if(jType){
    params.set("jType", jType);
  }
  if(exp){
    params.set("exp", exp);

  }
  if(salary){
    params.set("salary", salary);
  }
  if(skills){
    params.set("skills", skills);
  }
  if(isActive){
    params.set("isActive", isActive);
  }
  if(deadline){
    params.set("deadline", deadline);
  }
  const newURL = `${location.pathname}?${params.toString()}`;
  navigate(newURL, { replace: true });
  return newURL;
};

