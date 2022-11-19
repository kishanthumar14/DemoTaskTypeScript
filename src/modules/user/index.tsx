import * as React from "react";
import {
  Space,
  Table,
  Tag,
  Popconfirm,
  Button,
  Modal,
  Select,
  Form,
  Input,
  Switch,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
const { Option } = Select;
interface DataType {
  id: number;
  key: string;
  name: string;
  age: number;
  address: string;
  _id: string;
  form: any;
}

interface State {
  isLoaded: boolean;
  modelVisible: boolean;
  users: [];
  modelType: String;
  error: {};
  userListPagination: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger: boolean;
  };
  userEditDetail: {
    name: String;
    email: String;
    gender: String;
    status: String;
    id: String;
  };
}

class UserView extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLoaded: false,
      modelVisible: false,
      modelType: "Create",
      users: [],
      error: {},
      userListPagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: false,
      },
      userEditDetail: {
        name: "",
        email: "",
        gender: "",
        status: "",
        id: "",
      },
    };
  }
  async componentDidMount() {
    this.getUserList();
  }
  getUserList = async () => {
    const { userListPagination = { current: 1, pageSize: 10, total: 0 } } =
      this.state;
    this.setState({ isLoaded: true });
    let _id = userListPagination.current || "";
    console.log(_id, "_id");
    axios
      .get(`https://gorest.co.in/public/v1/users`, {
        params: { page: this.state.userListPagination.current },
      })
      .then(
        (results) => {
          console.log("object", results);
          this.setState({ isLoaded: false, users: results.data.data });
          this.setState({
            userListPagination: {
              ...this.state.userListPagination,
              total: results.data.meta.pagination.total,
            },
          });
        },
        (error) => {
          this.setState({ isLoaded: false, error });
        }
      );
  };
  handleTableChange = (data: any) => {
    console.log(data, "data");
    this.setState({
      userListPagination: {
        ...this.state.userListPagination,
        current: data.current,
        pageSize: data.pageSize,
      },
    });
    this.getUserList();
  };
  removeUser = async (record: any) => {
    this.setState({ isLoaded: true });
    let _id = record.id || "";
    axios.put(`https://gorest.co.in/public/v1/posts/${_id}`).then(
      (results) => {
        this.setState({ isLoaded: false });
      },
      (error) => {
        this.setState({ isLoaded: false, error });
      }
    );
    this.getUserList();
  };
  addUser = (data: any) => {
    let reqObj = {
      name: data.name,
      email: data.email,
      gender: data.gender,
      status: data.status || data.status === "true" ? "active" : "inactive",
      _id: this.state.userEditDetail.id || "",
    };

    axios
      .post(` https://gorest.co.in/public/v1/posts`, {
        params: { ...reqObj },
      })
      .then(
        (results) => {
          console.log("object", results);
          message.success(
            `User ${reqObj._id ? "updated" : "added"} Successfully`
          );
          this.getUserList();
        },
        (error) => {
          message.error(error);
          this.setState({ isLoaded: false, error });
        }
      );
    this.setState({ modelVisible: false });
  };
  modelActive = (visible: false) => {
    this.setState({ modelVisible: visible });
    let obj = { name: "", email: "", gender: "", status: "false", id: "" };
    this.setState({ userEditDetail: obj, modelType: "Create" });
  };
  editUser = async (record: any) => {
    this.setState({ isLoaded: true });
    let _id = record.id || "";
    axios.get(`https://gorest.co.in/public/v1/posts/${_id}`).then(
      (results) => {
        this.setState({ isLoaded: false });
      },
      (error) => {
        this.setState({ isLoaded: false, error });
      }
    );
    this.setState({
      modelVisible: true,
      modelType: "Edit",
      userEditDetail: record,
    });
  };
  render() {
    const {
      users = [],
      isLoaded = false,
      modelVisible = false,
      userListPagination = {},
      userEditDetail = { name: "", email: "", gender: "", status: "false" },
      modelType,
    } = this.state;
    const columns: ColumnsType<DataType> = [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (text) => <span>{text}</span>,
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
      },
      {
        title: "Gender",
        dataIndex: "gender",
        key: "gender",
      },
      {
        title: "Status",
        key: "status",
        dataIndex: "status",
        render: (text: string) => {
          let color = text === "active" ? "green" : "geekblue";
          return (
            <Tag color={color} key={"tag"}>
              {text.toUpperCase()}
            </Tag>
          );
        },
      },
      {
        title: "Action",
        key: "action",
        render: (_, record) => (
          <Space size="middle">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => {
                this.editUser(record);
              }}
            >
              <EditOutlined />
            </span>
            <span style={{ cursor: "pointer" }}>
              <Popconfirm
                placement="top"
                title="Are you sure you want to delete this user？"
                okText="Yes"
                cancelText="No"
                onConfirm={() => {
                  this.removeUser(record);
                }}
              >
                <DeleteOutlined />
              </Popconfirm>
            </span>
          </Space>
        ),
      },
    ];
    return (
      <div>
        <div style={{ margin: "10px" }}>
          <Button
            type="primary"
            style={{ float: "right" }}
            onClick={(e: any) => this.modelActive(e)}
          >
            User
          </Button>
        </div>
        <div style={{ margin: "10px", marginTop: "20px" }}>
          <Table
            bordered
            columns={columns}
            rowKey={(record) => record.id}
            dataSource={users}
            pagination={userListPagination}
            loading={isLoaded}
            onChange={this.handleTableChange}
          />
          <span>
            <Modal
              title={`${modelType} User`}
              centered
              open={modelVisible}
              onCancel={() => this.modelActive(false)}
              width={500}
              footer={null}
            >
              <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                initialValues={{ remember: true }}
                autoComplete="off"
                onFinish={(e: any) => this.addUser(e)}
              >
                <Form.Item
                  label="Name"
                  name="name"
                  initialValue={
                    userEditDetail && userEditDetail.name
                      ? userEditDetail.name
                      : ""
                  }
                  rules={[{ required: true, message: "Please add your name!" }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  initialValue={
                    userEditDetail && userEditDetail.email
                      ? userEditDetail.email
                      : ""
                  }
                  rules={[
                    {
                      type: "email",
                      message: "The add is not valid E-mail!",
                    },
                    {
                      required: true,
                      message: "Please add your E-mail!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[{ required: true, message: "Please select gender!" }]}
                  initialValue={
                    userEditDetail && userEditDetail.gender
                      ? userEditDetail.gender
                      : ""
                  }
                >
                  <Select placeholder="Select a gender" allowClear>
                    <Option value="male">male</Option>
                    <Option value="female">female</Option>
                    <Option value="other">other</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="status"
                  initialValue={
                    userEditDetail && userEditDetail.status
                      ? userEditDetail.status === "active"
                        ? true
                        : false
                      : false
                  }
                  label="Status"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ float: "right" }}
                  >
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </span>
        </div>
      </div>
    );
  }
}

export default UserView;
