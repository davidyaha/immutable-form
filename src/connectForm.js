import React from 'react';

const connectForm = (form, Component) => {
  class Wrapper extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.form = form;
    }
    componentDidMount() {
      this.unsubscribe = this.form.store.subscribe(() => {
        this.forceUpdate();
      });
    }
    componentWillUnmount() {
      this.unsubscribe();
    }
    render() {
      const fields = this.form.getFieldValues().toJS();
      return (
        <Component
          {...this.props}
          {...fields}
          form={this.form}
        />
      );
    }
  }

  return Wrapper;
};

export default connectForm;
