import React from 'react';
import styled from 'styled-components';

interface CardIconProps {
  children?: React.ReactNode;
}

const CardIcon: React.FC<CardIconProps> = ({ children }) => <StyledCardIcon>{children}</StyledCardIcon>;

const StyledCardIcon = styled.div`
  font-size: 36px;
  height: 95px;
  width: 95px;
  align-items: center;
  display: flex;
  justify-content: center;
`;

export default CardIcon;
