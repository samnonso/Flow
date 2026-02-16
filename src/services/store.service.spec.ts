
import { TestBed } from '@angular/core/testing';
import { StoreService } from './store.service';

declare var describe: any;
declare var beforeEach: any;
declare var it: any;
declare var expect: any;

describe('StoreService', () => {
  let service: StoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Song Management', () => {
    it('should add a song to the current setlist', () => {
      const initialLength = service.currentSetlist().length;
      const newSong = {
        id: 'test-song',
        title: 'Test Song',
        artist: 'Test Artist',
        bpm: 100,
        key: 'C',
        notes: 'Test notes'
      };

      service.addSong(newSong);
      const setlist = service.currentSetlist();
      
      expect(setlist.length).toBe(initialLength + 1);
      expect(setlist.find(s => s.id === 'test-song')).toBeTruthy();
    });

    it('should delete a song from the setlist', () => {
      const newSong = {
        id: 'delete-me',
        title: 'Delete Me',
        artist: 'Test',
        bpm: 100,
        key: 'C',
        notes: ''
      };
      service.addSong(newSong);
      expect(service.currentSetlist().find(s => s.id === 'delete-me')).toBeTruthy();

      service.deleteSong('delete-me');
      expect(service.currentSetlist().find(s => s.id === 'delete-me')).toBeFalsy();
    });
  });

  describe('Choir Management', () => {
    it('should add a new choir member', () => {
      const newMember = {
        id: 'new-mem',
        name: 'New Member',
        role: 'Alto',
        email: 'test@test.com',
        phone: '123'
      };
      service.addChoirMember('members', newMember);
      
      const group = service.choirGroup();
      expect(group.members.find(m => m.id === 'new-mem')).toBeTruthy();
    });
  });

  describe('Localization', () => {
    it('should toggle language', () => {
      expect(service.lang()).toBe('en');
      service.toggleLang();
      expect(service.lang()).toBe('fr');
      expect(service.t().dashboard.welcome).toBe('Wesh');
    });
  });
});
