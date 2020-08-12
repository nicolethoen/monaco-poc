import React from 'react';
import ReactDOM from 'react-dom';
import '@patternfly/react-core/dist/styles/base.css';
import MonacoEditor, { MonacoDiffEditor } from "react-monaco-editor";
import {
  Button,
  Page,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  EmptyStateBody,
  EmptyStateSecondaryActions,
  PageSection,
  PageSectionVariants,
  Title,
  Flex,
  FlexItem,
  Checkbox,
  Tooltip
} from '@patternfly/react-core';
import { CodeIcon, CopyIcon, DownloadIcon, UploadIcon } from '@patternfly/react-icons';
import Dropzone from "react-dropzone";
import './poc.css';

class CodeEditor extends React.Component {
  constructor() {
    super();
    this.state = {
      value: "<html><!-- This very long comment will demonstrate the default ability to include horizontal scroll at the more narrow widths -->\n<head>\n	<!-- HTML comment -->\n	<style type=\"text/css\">\n		/* CSS comment */\n	</style>\n	<script type=\"javascript\">\n		// JavaScript comment\n	</"+"script>\n</head>\n<body></body>\n</html>",
      language: 'text/html',
      darkTheme: false,
      narrowWidth: false,
      lineNumbers: true,
      readOnly: false,
    };
  }

  onChange = (newValue) => {
    console.log("onChange", newValue); // eslint-disable-line no-console
  };

  editorDidMount = (editor) => {
    // eslint-disable-next-line no-console
    console.log("editorDidMount", editor, editor.getValue(), editor.getModel());
    this.editor = editor;
  };

  changeTheme = (darkTheme) => {
    this.setState({ darkTheme });
  };

  changeWidth = (narrowWidth) => {
    this.setState({ narrowWidth });
  };

  toggleReadOnly = (readOnly) => {
    this.setState({ readOnly });
  };

  toggleLineNumbers = (lineNumbers) => {
    this.setState({ lineNumbers });
  };

  render() {
    const { value, lineNumbers, readOnly, narrowWidth, darkTheme } = this.state;
    const options = {
      selectOnLineNumbers: true,
      roundedSelection: false,
      cursorStyle: "line",
      automaticLayout: false,
      readOnly: readOnly,
      lineNumbers: lineNumbers ? "on" : "off"
    };

    return (
      <div>
        <div>
          <Checkbox
            label="Dark theme"
            isChecked={this.state.darkTheme}
            onChange={this.changeTheme}
            aria-label="dark theme"
            id="dark-theme-checkbox"
            name="dark-theme-checkbox"
          />
          <Checkbox
            label="Narrow width"
            isChecked={this.state.narrowWidth}
            onChange={this.changeWidth}
            aria-label="narrow width"
            id="narrow-width-checkbox"
            name="narrow-width-checkbox"
          />
          <Checkbox
            label="Line numbers"
            isChecked={this.state.lineNumbers}
            onChange={this.toggleLineNumbers}
            aria-label="line numbers"
            id="line-numbers-checkbox"
            name="line-numbers-checkbox"
          />
          <Checkbox
            label="Read only"
            isChecked={this.state.readOnly}
            onChange={this.toggleReadOnly}
            aria-label="read only"
            id="read-only-checkbox"
            name="ready-only-checkbox"
          />
        </div>
        <MonacoEditor
          height="400"
          width={narrowWidth ? "800" : ""}
          language="text/html"
          value={value}
          options={options}
          onChange={this.onChange}
          editorDidMount={this.editorDidMount}
          theme={darkTheme ? "vs-dark" : "vs-light"}
        />
      </div>
    );
  }
}

const Languages = {
  js: "javascript",
  html: "html",
  txt: "text",
  json: "json",
  css: "css"
};

const Extensions = {
  javascript: "js",
  html: "html",
  text: "txt",
  json: "json",
  css: "css"
};

class CodeEditorUploadDownload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      language: 'html',
      filename: '',
      isLoading: false,
      dropzoneProps: {},
      showEmptyState: true,
    };
  }

  onChange = (newValue) => {
    console.log("onChange", newValue); // eslint-disable-line no-console
  };

  editorDidMount = (editor) => {
    // eslint-disable-next-line no-console
    console.log(editor.getValue(), editor.getModel());
    this.editor = editor;
  };

  handleFileChange = (value, filename, event) => {
    const extension = filename.split('.').pop();
    this.setState({
      value,
      filename,
      language: Languages[extension]
    });
  };

  handleFileReadStarted = fileHandle => this.setState({ isLoading: true });
  handleFileReadFinished = fileHandle => this.setState({ isLoading: false });

  readFile(fileHandle) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(fileHandle);
    });
  }

  onDropAccepted = (acceptedFiles, event) => {
    if (acceptedFiles.length > 0) {
      const fileHandle = acceptedFiles[0];
      this.handleFileChange('', fileHandle.name, event); // Show the filename while reading
      this.handleFileReadStarted(fileHandle);
      this.readFile(fileHandle)
          .then(data => {
            this.handleFileReadFinished(fileHandle);
            this.handleFileChange(data, fileHandle.name, event);
          })
          .catch((error) => {
            console.log("error", error);
            this.handleFileReadFinished(fileHandle);
            this.handleFileChange('', '', event); // Clear the filename field on a failure
          });
    }
    this.state.dropzoneProps.onDropAccepted && this.state.dropzoneProps.onDropAccepted(acceptedFiles, event);
  };

  onDropRejected = (rejectedFiles, event) => {
    if (rejectedFiles.length > 0) {
      onChange('', rejectedFiles[0].name, event);
    }
    this.state.dropzoneProps.onDropRejected && this.state.dropzoneProps.onDropRejected(rejectedFiles, event);
  };

  copyCode = () => {
    this.editor.focus();
    document.execCommand('copy');
  };

  download = () => {
    const { value, language } = this.state;
    const element = document.createElement("a");
    const file = new Blob([value], {type: "text"});
    element.href = URL.createObjectURL(file);
    element.download = `myFile.${Extensions[language]}`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  toggleEmptyState = () => {
    this.setState({showEmptyState: false})
  }

  render() {
    const { value, dropzoneProps, isLoading, language, showEmptyState } = this.state;
    const options = {
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: "line",
      automaticLayout: false,
    };

    return (
      <Dropzone multiple={false} {...dropzoneProps} onDropAccepted={this.onDropAccepted} onDropRejected={this.onDropRejected}>
        {({ getRootProps, getInputProps, isDragActive, open }) => (
          <div
            {...getRootProps({
              onClick: event => event.preventDefault() // Prevents clicking TextArea from opening file dialog
            })}
            className={`pf-c-file-upload ${isDragActive && "pf-m-drag-hover"} ${isLoading && "pf-m-loading"}`}
          >
            <Flex spaceItems={{ default: 'spaceItemsNone' }}>
              <FlexItem>
                <Tooltip
                    trigger="click"
                    content={<div>Content added to clipboard</div>}
                >
                  <Button onClick={this.copyCode} variant="control">
                    <CopyIcon />
                  </Button>
                </Tooltip>
              </FlexItem>
              <FlexItem>
                <Button onClick={open} variant="control">
                  <UploadIcon />
                </Button>
              </FlexItem>
              <FlexItem>
                <Button onClick={this.download} variant="control">
                  <DownloadIcon />
                </Button>
              </FlexItem>
              <FlexItem align={{ default: 'alignRight' }}>
                <Button variant="control"><CodeIcon /> {language.toUpperCase()}</Button>
              </FlexItem>
            </Flex>
            <input {...getInputProps()} /* hidden, necessary for react-dropzone */ />
            { showEmptyState && !value ? (
                <EmptyState variant={EmptyStateVariant.small}>
                  <EmptyStateIcon icon={CodeIcon} />
                  <Title headingLevel="h4" size="lg">
                    Start editing
                  </Title>
                  <EmptyStateBody>
                    Drag a file here or browse to upload
                  </EmptyStateBody>
                  <Button variant="primary" onClick={open}>Browse</Button>
                  <EmptyStateSecondaryActions>
                    <Button variant="link" onClick={this.toggleEmptyState}>Start from scratch</Button>
                  </EmptyStateSecondaryActions>
                </EmptyState>
            ) : (
              <MonacoEditor
                height="400"
                language={language}
                value={value}
                options={options}
                onChange={this.onChange}
                editorDidMount={this.editorDidMount}
                theme="vs-light"
              />
            )}
          </div>
        )}
      </Dropzone>
    );
  }
}

class DiffEditor extends React.Component {
  constructor() {
    super();
    this.state = {
      value: 'const a = "Hello Monaco"',
      original: 'const a = "Hello World"',
    };
  }

  onChange = (newValue) => {
    console.log("onChange", newValue); // eslint-disable-line no-console
  };

  render() {
    const { value, original } = this.state;
    return (
      <div>
        <Button onClick={() => this.setState({ value })} variant="control">
          Reset
        </Button>
        <hr style={{width: 1200}}/>
        <MonacoDiffEditor
          height="300"
          language="javascript"
          value={value}
          original={original}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

class InlineEditor extends React.Component {
  constructor() {
    super();
    this.state = {
      value: 'const a = "Hello Monaco"',
      original: 'const a = "Hello World"',
    };
  }

  onChange = (newValue) => {
    console.log("onChange", newValue); // eslint-disable-line no-console
  };

  render() {
    const { value } = this.state;
    const options = {
      lineNumbers: "off",
      scrollBeyondLastLine: false,
      minimap: {
        enabled: false
      },
      scrollbar: {
        vertical: 'hidden'
      }
    };
    return (
      <div className="hideOverflowRuler">
        <Button onClick={() => this.setState({ value })} variant="control">
          Reset
        </Button>
        <hr style={{width: 1200}}/>
        <MonacoEditor
          height="20"
          language="javascript"
          value={value}
          onChange={this.onChange}
          options={options}
        />
      </div>
    );
  }
}

const App = () => (
  <Page>
    <PageSection variant={PageSectionVariants.light}>
      <Title headingLevel="h1">Basic example</Title>
      <CodeEditor />
    </PageSection>
    <PageSection variant={PageSectionVariants.light}>
      <Title headingLevel="h1">Upload/download example</Title>
      <div>For simplicity, this example only accept files with the following extensions: .js .html .css .txt .json</div>
      <CodeEditorUploadDownload />
    </PageSection>
    <PageSection variant={PageSectionVariants.light}>
      <Title headingLevel="h1">Diff example</Title>
      <DiffEditor />
    </PageSection>
  </Page>

);

ReactDOM.render(<App />, document.getElementById('root'));
