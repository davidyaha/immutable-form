import React from 'react';
import { isFunction } from 'lodash';
import FormCollection from './FormCollection';

const connectForm = form => (Component) => {
  class Wrapper extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = {
        loaded: false,
      };
    }
    async componentDidMount() {
      await this.reloadForm(this.props);
    }
    async componentWillReceiveProps(nextProps) {
      if (isFunction(form)) {
        this.setState({
          loaded: false,
        });
        await this.reloadForm(nextProps);
      }
    }
    componentWillUnmount() {
      this.unsubscribe();
      FormCollection.remove(this.form.name);
      this.setState({
        loaded: false,
      });
    }
    async reloadForm(props) {
      this.form = (isFunction(form) ? form : () => form)(props);
      this.unsubscribe = this.form.store.subscribe(() => {
        this.forceUpdate();
      });
      if (isFunction(this.form.loadPromise)) {
        await this.form.load();
      }
      this.setState({
        loaded: true,
      });
    }
    render() {
      if (!this.state.loaded) {
        return null;
      }
      const fields = this.form.getFields();
      return React.cloneElement(Component, {
        ...this.props,
        fields,
        form: this.form,
      });
    }
  }

  return Wrapper;
};

export default connectForm;
