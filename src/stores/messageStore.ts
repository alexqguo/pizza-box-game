import { observable, action } from 'mobx';
import { Message } from '../types';

export default class MessageStore {
  @observable messages: Message[] = [];

  @action addMessage = (message: Message) => {
    this.messages.push(message);
  }
}