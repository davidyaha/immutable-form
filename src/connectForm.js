import React from 'react';
import { connect, Provider } from 'react-redux';
import { compose, withProps, render } from 'recompose';
import Form from './Form';

const connectForm = (name, initialState, Component) => {
  const form = new Form(name, initialState);
  class Wrapper extends React.Component {
    componentDidMount() {
      this.unsubscribe = form.store.subscribe(() => {
        this.forceUpdate();
      });
    }
    compontnWillUnmount() {
      this.unsubscribe();
    }
    render() {
      return this.props.children;
    }
  }

  return (
    <Wrapper>
      <Component />
    </Wrapper>);
};

export default connectForm;
