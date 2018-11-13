import React, { Component } from "react";
import { Row, Col, Card, CardHeader, CardText, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import { createBrowserHistory } from "history";

const history = createBrowserHistory();

class FileUpload extends Component {
  state = {
    documents: [],
    open: false
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = fileLink => {
    this.setState({
      open: false
    });
    history.push(`${fileLink}`);
    window.location.reload();
  };

  deleteDocument = id => {
    axios.delete("/api/document/" + id).then(() => {
      this.setState({
        documents: this.state.documents.filter(document => document._id !== id)
      });
    });
  };

  componentDidMount() {
    axios.get("/api/document").then(res => {
      this.setState({ documents: res.data });
    });
  }

  // importAll() is to leverage webpack's require.context so I can dynamically import all the files in a directory
  // https://webpack.js.org/guides/dependency-management/#require-context
  // The syntax is as follows:
  // require.context(directory, useSubdirectories = false, regExp = /^\.\//);
  // so importAll() takes an object as its argument and returns an object where each key is the full-name of the file (and the "./" part taken-off from it). Like 1541668392919-file.pdf
  importAll = result => {
    let images = {};
    result.keys().map((item, index) => {
      return (images[item.replace("./", "")] = result(item));
    });
    return images;
  };

  render() {
    const webpackContext = require.context(
      "../../uploads",
      false,
      /\.(png|jpe?g|svg|pdf|doc|odt)$/
    );

    /*
    A> In above, I am requiring a context with files from the 'documents' directory that can be required with a request endings with .png .jpeg .svg etc .

    B> And the final returned object ( after searching the directory ) from the require.context is passed as the argument to importAll()

    C> So,console.log(webpackContext.keys()); will print the below

     ["./1541656477973-file.pdf", "./1541671735212-file.jpeg"]

     And all importAll() is doing is replacing the "./" with empty space and returing the 'images' array.

 */

    const images = this.importAll(webpackContext);
    console.log(images);

    return (
      <div className="bg-success">
        <Col xs="8">
          <Card>
            <CardHeader className="p-2 mb-2 bg-primary text-white" />
            <CardBody>
              <CardText>
                <table className="table table-stripe">
                  <thead>
                    <tr>
                      <th>Document Id</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.documents.map(document => (
                      <tr>
                        <td>{document.document_id}</td>
                        <td>{document.description}</td>
                        <td>
                          <Button onClick={this.handleClickOpen}>
                            Download file
                          </Button>
                          <Dialog
                            open={this.state.open}
                            onClose={this.handleClose}
                            aria-labelledby="form-dialog-title"
                          >
                            <DialogTitle id="form-dialog-title">
                              Required Information
                            </DialogTitle>
                            <DialogContent>
                              <DialogContentText>
                                Update these info to download the file
                              </DialogContentText>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="name"
                                label="Email Address"
                                type="email"
                                fullWidth
                              />
                            </DialogContent>
                            <DialogActions>
                              <Button
                                onClick={this.handleClose}
                                color="primary"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={this.handleClose.bind(
                                  this,
                                  images[`${document.path}`]
                                )}
                                color="primary"
                              >
                                Download file
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </td>
                        <td>
                          <Link
                            to={`/api/document/edit/${document._id}`}
                            class="btn btn-success"
                          >
                            Edit Description
                          </Link>
                        </td>
                        <td>
                          <button
                            onClick={this.deleteDocument.bind(
                              this,
                              document._id
                            )}
                            className="btn btn-danger"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardText>
            </CardBody>
          </Card>
        </Col>

        <Row>
          <Col>
            <div class="float-sm-right m-b-sm">
              <h4>
                <Link
                  to={"/api/document/upload"}
                  className="btn btn-secondary btn-sm active"
                  role="button"
                  aria-pressed="true"
                >
                  Add a New Document
                </Link>
              </h4>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default FileUpload;

// http://localhost:3000/static/media/1542037580268-file.a03c8981.pdf
// {images[`${document.path}`]}
