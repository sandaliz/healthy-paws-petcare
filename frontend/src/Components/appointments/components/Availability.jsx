import React, {useState, useEffect} from 'react';
import {Modal, Button, DatePicker, Input, Select, Form, message} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSnapshot } from 'valtio';
import state from '../store/state';
import appointmentServices from '../services/AppointmentServices';
import doctorServices from '../services/DoctorServices';
import dayjs from "dayjs";
import AppointmentServices from '../services/AppointmentServices';

const {Option} = Select;

const schedule = [
  { day: 'Mon', hours: '09:00 - 17:00' },
  { day: 'Tue', hours: '09:00 - 17:00' },
  { day: 'Wed', hours: '09:00 - 17:00' },
  { day: 'Thu', hours: '10:00 - 18:00' },
  { day: 'Fri', hours: '09:00 - 17:00' },
  { day: 'Sat', hours: '10:00 - 14:00' },
  { day: 'Sun', hours: 'Closed' },
];

const Availability = () => {
  const navigate = useNavigate();
  const snap = useSnapshot(state);
  const [form] = Form.useForm();
  const [doctors, setDoctors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointment, setAppointments] = useState([])

  const showModal = () => {
    if (!snap.currentUser) {
      message.warning('Please login to book an appointment');
      navigate('/login');
      return;
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const fetchAppointments = async()=> {
    try{
      const response = await AppointmentServices.getAppointment()
      setAppointments(response)
    }catch(error){
      console.error('failed to load appointment', error)
    }
  }

  const fetchDoctors = async ()=> {
    try{
      const response = await doctorServices.getDoctors();
      setDoctors(response);
    }catch(error){
      console.error('failed get doctors details', error);
      message.error("Failed to load doctor details.");
    }
  }

  const getNextAppointmentId = () => {
    if (appointment.length === 0) {
      return 'A001';
    }
    
    // Sort appointments by ID to find the last one
    const sortedAppointments = [...appointment].sort((a, b) => {
      const idA = parseInt(a.appointmentId.substring(1));
      const idB = parseInt(b.appointmentId.substring(1));
      return idA - idB;
    });

    const lastAppointment = sortedAppointments[sortedAppointments.length - 1];
    const lastIdNumber = parseInt(lastAppointment.appointmentId.substring(1));
    const nextIdNumber = lastIdNumber + 1;
    
    // Pad the number with leading zeros
    const paddedId = String(nextIdNumber).padStart(3, '0');
    return `A${paddedId}`;
  };

  const handleSubmitForm = async (values) => {
    try {
      const newAppointmentId = getNextAppointmentId();
      const appointmentData = {
        ...values,
        appointmentId: newAppointmentId,
        appointmentDate: dayjs(values.appointmentDate).toISOString(),
      };
      
      const response = await appointmentServices.createAppointment(appointmentData);
      console.log("Appointment created:", response);
      message.success("Appointment booked successfully!");
      handleCancel();

    } catch (error) {
      console.error("Error creating appointment:", error);
      message.error("Failed to book appointment. Please try again.");
    }
  }

  const disabledPastDates = (current) => {
    // Can not select days before today
    return current && current < dayjs().startOf('day');
  };

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  return (
    <section id="availability" className="py-16 sm:py-20" style={{ backgroundColor: '#FFD58E' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: '#54413C' }}>Available Time</h2>
          <p className="mt-3" style={{ color: '#333333' }}>Our doctors are here for you and your pets.</p>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {schedule.map((d) => (
            <div key={d.day} className="rounded-2xl p-4 text-center shadow-sm ring-1" style={{ backgroundColor: 'white', borderColor: '#54413C' }}>
              <div className="text-sm font-semibold" style={{ color: '#54413C' }}>{d.day}</div>
              <div className="mt-1" style={{ color: '#333333' }}>{d.hours}</div>
            </div>
          ))}
        </div>

        <div id="book" className="mt-10 flex justify-center">
          <Button style={{ backgroundColor: '#54413C', color: 'white' }} onClick={showModal}>
            Appointment
          </Button>
        </div>
      </div>

      {/* Appointment Modal */}
      <Modal
        title="Book Appointment"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null} 
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitForm} 
        >
          {/* Pet name */}
          <Form.Item
            name="pet"
            label="Pet Name"
            rules={[{ required: true, message: "Please enter your pet's name" }]}
          >
            <Input placeholder="Enter pet name" />
          </Form.Item>

          {/* Owner name */}
          <Form.Item
            name="owner"
            label="Owner Name"
            rules={[{ required: true, message: "Please enter owner's name" }]}
          >
            <Input placeholder="Enter owner's name" />
          </Form.Item>

          {/* Appointment type */}
          <Form.Item
            name="type"
            label="Pet Type"
            rules={[{ required: true, message: "Please select pet type" }]}
          >
            <Input placeholder="Enter pet's type" />
          </Form.Item>
          
          {/* Owner Contact */}
          <Form.Item
            name="contact"
            label="Owner Contact"
            rules={[
              { required: true, message: "Please enter owner's contact" },
              { pattern: /^\d{10}$/, message: "Contact number must be 10 digits" },
            ]}
          >
            <Input placeholder="Enter owner's contact" />
          </Form.Item>

          {/* Doctor selection */}
          <Form.Item
            name="doctor"
            label="Select Doctor"
            rules={[{ required: true, message: "Please select a doctor" }]}
          >
            <Select placeholder="Choose a doctor">
              {doctors.map((doc) => (
                <Option key={doc._id} value={doc._id}>
                  {doc.name} — {doc.specialty}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Appointment date */}
          <Form.Item
            name="appointmentDate"
            label="Appointment Date"
            rules={[{ required: true, message: "Please pick a date" }]}
          >
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
              disabledDate={disabledPastDates}
            />
          </Form.Item>

          {/* Hidden status */}
          <Form.Item name="status" initialValue="pending" hidden>
            <Input />
          </Form.Item>

          {/* Custom Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block style={{ backgroundColor: '#54413C', borderColor: '#54413C' }}>
              Book Appointment
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}

export default Availability;