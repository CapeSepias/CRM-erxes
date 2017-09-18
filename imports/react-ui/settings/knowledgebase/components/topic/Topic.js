import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  ButtonToolbar,
  Modal,
} from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import SelectBrand from '../SelectBrand';
import CopyToClipboard from 'react-copy-to-clipboard';
import { CommonItem } from '../common';

const propTypes = {
  item: PropTypes.object.isRequired,
  brands: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
};

class KbTopic extends CommonItem {
  constructor(props, context) {
    super(props, context);

    let code = '';

    // showed install code automatically in edit mode
    if (props.item) {
      code = this.constructor.getInstallCode(props.item._id);
    }

    this.state = {
      code,
      copied: false,
      selectedCategories: this.getSelectedCategories(),
    };

    this.handleBrandChange = this.handleBrandChange.bind(this);
  }

  getCategories() {
    const { categories } = this.props;
    let results = [];

    results.push({
      label: 'Categories',
      options: categories.map(category => ({
        label: category.title,
        value: category._id,
      })),
    });
    return results;
  }

  getSelectedCategories() {
    const { item } = this.props;
    return (item.categories || []).map(category => ({
      label: category.title,
      value: category._id,
    }));
  }

  static installCodeIncludeScript() {
    return `
      (function() {
        var script = document.createElement('script');
        script.src = "${Meteor.settings.public.CDN_HOST}/knowledgeBaseWidget.bundle.js";
        script.async = true;

        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
      })();
    `;
  }

  static getInstallCode(topicId) {
    return `
      <script>
        window.erxesSettings = {
          knowledgeBase: {
            topic_id: "${topicId}"
          },
        };
        ${KbTopic.installCodeIncludeScript()}
      </script>
    `;
  }

  renderInstallCode() {
    if (this.props.item && this.props.item._id) {
      return (
        <FormGroup controlId="install-code">
          <ControlLabel>Install code</ControlLabel>
          <div className="markdown-wrapper">
            <ReactMarkdown source={this.state.code} />
            {this.state.code
              ? <CopyToClipboard
                  text={this.state.code}
                  onCopy={() => this.setState({ copied: true })}
                >
                  <Button bsSize="small" bsStyle="primary">
                    {this.state.copied ? 'Copied' : 'Copy to clipboard'}
                  </Button>
                </CopyToClipboard>
              : null}
          </div>
        </FormGroup>
      );
    } else {
      return null;
    }
  }

  handleBrandChange() {
    if (this.props.item && this.props.item._id) {
      const code = this.constructor.getInstallCode(this.props.item._id);
      this.setState({ code, copied: false });
    }
  }

  handleSubmit(e) {
    super.handleSubmit(e);
    const categoryIds = this.state.selectedCategories.map(category => category.value);
    const { item } = this.props;

    var newValues = {
      title: document.getElementById('knowledgebase-title').value,
      description: document.getElementById('knowledgebase-description').value,
      brandId: document.getElementById('selectBrand').value,
      categoryIds,
      _id: item._id,
      createdBy: item.createdBy,
      createdDate: new Date(item.createdDate),
      modifiedBy: item.modifiedBy,
      modifiedDate: new Date(item.modifiedDate),
    };

    this.props.save(newValues);
    this.context.closeModal();
  }

  render() {
    const { item = {} } = this.props;
    const { brands } = this.props;
    const { brand } = item;
    const brandId = brand != null ? brand._id : '';

    return (
      <form className="margined" onSubmit={this.handleSubmit}>
        <FormGroup controlId="knowledgebase-title">
          <ControlLabel>Title</ControlLabel>
          <FormControl type="text" defaultValue={item.title} required />
        </FormGroup>

        <FormGroup controlId="knowledgebase-description">
          <ControlLabel>Description</ControlLabel>
          <FormControl type="text" defaultValue={item.description} />
        </FormGroup>

        <FormGroup>
          <SelectBrand brands={brands} defaultValue={brandId} onChange={this.handleBrandChange} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Categories</ControlLabel>

          <Select
            placeholder="Choose categories"
            onChange={items => {
              this.setState({ selectedCategories: items });
            }}
            optionRenderer={option => (
              <div className="simple-option">
                <span>{option.label}</span>
              </div>
            )}
            value={this.state.selectedCategories}
            options={this.getCategories()}
            multi
          />
        </FormGroup>

        {this.renderInstallCode()}

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }
}

KbTopic.propTypes = propTypes;

export default KbTopic;
