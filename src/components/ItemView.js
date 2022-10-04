import React from "react";
import {Box, Button} from "monday-ui-react-core";

import mondaySdk from "monday-sdk-js";

const monday = mondaySdk();
monday.setToken(process.env.REACT_APP_MONDAY_TOKEN);

class ItemView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            status: '',
            description: '',
            itemId: '',
            boardId: ''
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        monday.listen("context", async res => {
            if (res.data.itemId) {
                this.setState({itemId: res.data.itemId, boardId: res.data.boardId});
                const itemId = res.data.itemId;
                await monday.api(`query { items (ids: ${itemId}) { name column_values { id text title} } }`).then(res => {
                    const item = res.data.items[0];
                    const columnValues = item.column_values;
                    const name = item.name;
                    const status = columnValues.find(columnValue => columnValue.title === "Status" || columnValue.title === "status").text;
                    const description = columnValues.find(columnValue => columnValue.title === "Description" || columnValue.title === "description").text;
                    this.setState({name: name, status: status, description: description});
                });
            }
        });
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        const name = this.state.name;
        const status = this.state.status;
        const description = this.state.description;
        const item_id = this.state.itemId;
        const board_id = this.state.boardId;

        //get the column id of the status column
        monday.api(`query { boards(ids: ${board_id}) { columns { id title } } }`).then(res => {
                const columns = res.data.boards[0].columns;
                const status_column_id = columns.find(column => column.title === "Status" || column.title === "status").id;
                const description_column_id = columns.find(column => column.title === "Description" || column.title === "description").id;
                const name_column_id = columns.find(column => column.title === "Name" || column.title === "name").id;

                const query = `mutation {
                  change_multiple_column_values (item_id: ${item_id}, board_id: ${board_id}, column_values: "{\\"${name_column_id}\\": \\"${name}\\", \\"${status_column_id}\\": \\"${status}\\", \\"${description_column_id}\\": \\"${description}\\"}") {
                    id
                  }
                }`;

                monday.api(query).then(() => {
                    monday.execute("notice", {
                        message: "Item updated successfully",
                        type: "success",
                        timeout: 5000
                    });
                });

            }
        );

        event.preventDefault();
    }

    render() {
        return (
            <div className="components-Box-__stories__-Box-stories-module__boxWrapper--FNDBW">
                <Box
                    border="components-Box-Box-module__border--oFq69"
                    rounded="components-Box-Box-module__roundedMedium--x875c"
                    margin={Box.margins.XXXL}
                    padding={Box.paddings.XL}
                >
                    <form onSubmit={this.handleSubmit}>
                        <div className="monday-storybook-text-field_box">
                            <h1>Custom Item View</h1>
                            <div className="monday-storybook-text-field_box_wrapper">
                                <div style={{margin: "20px", width: '100%'}}></div>

                                <h6 className="monday-storybook-label_title">Item Name</h6>
                                <input
                                    className="monday-select"
                                    name="name"
                                    type="text"
                                    value={this.state.name}
                                    onChange={this.handleInputChange}
                                    autoComplete={"off"}
                                    placeholder={"Input item name"}
                                    required={true}
                                />
                                <div style={{margin: "20px", width: '100%'}}></div>

                                <h6 className="monday-storybook-label_title">Item Status</h6>
                                <select value={this.state.status} onChange={this.handleInputChange}
                                        required={true} id="item-status" className="monday-select" name="status">
                                    <option value="" disabled>Select Item Status</option>
                                    <option value="Working on it">Working on it</option>
                                    <option value="Stuck">Stuck</option>
                                    <option value="Done">Done</option>
                                </select>
                                <div style={{margin: "20px", width: '100%'}}></div>

                                <h6 className="monday-storybook-label_title">Item Description</h6>
                                <textarea
                                    className="monday-textarea"
                                    name="description"
                                    value={this.state.description}
                                    onChange={this.handleInputChange}
                                    autoComplete={"off"}
                                    placeholder={"Input item description"}
                                    required={true}
                                    rows="4" cols="50"
                                />
                                <div style={{margin: "20px", width: '100%'}}></div>

                                <Button type={Button.types.SUBMIT}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </form>
                </Box>
            </div>
        );
    }
}

export default ItemView;
