import React from 'react';
import { render, waitFor } from '@testing-library/react';
import VideoChat from './VideoChat';

jest.mock('socket.io-client', () => {
    return {
        connect: () => {
            return {
                on: () => {},
                emit: () => {},
                disconnect: () => {},
            };
        },
    };
});

jest.mock('navigator.mediaDevices', () => {
    return {
        getUserMedia: () => {
            return Promise.resolve({
                getTracks: () => {
                    return [];
                },
            });
        },
    };
});

test('renders video chat component', () => {
    const { getByText } = render(<VideoChat />);
    expect(getByText('Video Chat')).toBeInTheDocument();
});

test('establishes socket connection', async () => {
    const socketConnect = jest.spyOn(io, 'connect');
    render(<VideoChat />);
    await waitFor(() => expect(socketConnect).toHaveBeenCalledTimes(1));
});

test('requests user media', async () => {
    const getUserMedia = jest.spyOn(navigator.mediaDevices, 'getUserMedia');
    render(<VideoChat />);
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
});