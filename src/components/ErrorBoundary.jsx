import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * @component ErrorBoundary
 * @description Catches render errors in child components
 * @param {Object} props
 * @param {React.ReactNode} props.children - child tree to protect
 */
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <p>Something went wrong.</p>;
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
