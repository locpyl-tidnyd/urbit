import { Box, Col, Icon, Image, Row, Text } from '@tlon/indigo-react';
import { Group } from '@urbit/api';
import { GraphNode } from '@urbit/api/graph';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
    getComments,
    getLatestRevision,
    getSnippet
} from '~/logic/lib/publish';
import useHarkState from '~/logic/state/hark';
import Author from '~/views/components/Author';

interface NotePreviewProps {
  host: string;
  book: string;
  node: GraphNode;
  baseUrl: string;
  group: Group;
}

const WrappedBox = styled(Box)`
  overflow-wrap: break-word;
`;

export function NotePreviewContent({ snippet }) {
  return (
    <ReactMarkdown
      unwrapDisallowed
      allowedTypes={['text', 'root', 'break', 'paragraph', 'image']}
      renderers={{
        image: props => (
          <Box
            backgroundImage={`url(${props.src})`}
            style={{ backgroundSize: 'cover',
              backgroundPosition: 'center' }}
          >
            <Image src={props.src} opacity={0} maxHeight="300px" />
          </Box>
        ),
        paragraph: props => (
          <Text>
            {props.children}
          </Text>
        )
      }}
      source={snippet}
    />
  );
}

export function NotePreview(props: NotePreviewProps) {
  const { node, group } = props;
  const { post } = node;
  if (!post || typeof post === 'string') {
    return (
      <Box width="100%" py="3">
        <Text gray>This note has been deleted.</Text>
      </Box>
    );
  }

  const numComments = getComments(node).children.size;
  const noteId = post.index.split('/')[1];
  const url = `${props.baseUrl}/note/${noteId}`;

  const [rev, title, body, content] = getLatestRevision(node);
  const appPath = `/ship/${props.host}/${props.book}`;
  const unreads = useHarkState(state => state.unreads);
  const isUnread = unreads.graph?.[appPath]?.['/']?.unreads?.has(`/${noteId}/1/1`);

  const snippet = getSnippet(body);

  const commColor = (unreads.graph?.[appPath]?.[`/${noteId}`]?.unreads ?? 0) > 0 ? 'blue' : 'gray';

  const cursorStyle = post.pending ? 'default' : 'pointer';

  return (
    <Box width='100%' opacity={post.pending ? '0.5' : '1'}>
      <Link
        to={post.pending ? '#' : url}
        style={ { cursor: cursorStyle } }
      >
        <Col
          lineHeight='tall'
          width='100%'
          color={!isUnread ? 'lightGray' : 'blue'}
          border={1}
          borderRadius={2}
          alignItems='flex-start'
          overflow='hidden'
          p={2}
        >
          <WrappedBox mb={2}><Text bold>{title}</Text></WrappedBox>
          <WrappedBox>
            <Text fontSize='14px' lineHeight='tall'>
              <NotePreviewContent snippet={snippet} />
            </Text>
          </WrappedBox>
        </Col>
      </Link>
      <Row minWidth={0} flexShrink={0} width="100%" justifyContent="space-between" py={3} bg="white">
        <Author
          showImage
          ship={post?.author}
          date={post?.['time-sent']}
          group={group}
          unread={isUnread}
        />
        <Box ml="auto" mr={1}>
          <Link to={url}>
            <Box display='flex'>
              <Icon color={commColor} icon='Chat' />
              <Text color={commColor} ml={1}>{numComments}</Text>
            </Box>
          </Link>
        </Box>
      </Row>
    </Box>
  );
}
