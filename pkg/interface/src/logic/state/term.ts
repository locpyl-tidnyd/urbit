import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { BaseState, createState } from "./base";

type Session  = { term: Terminal, fit: FitAddon };
type Sessions = { [id: string]: Session; }

export interface TermState extends BaseState<TermState> {
  sessions: Sessions,
  selected: string,
};

const useTermState = createState<TermState>('Term', {
  sessions: {},
  selected: '',  //  empty string is default session
}, ['sessions']);  //TODO  consider persisting

export default useTermState;