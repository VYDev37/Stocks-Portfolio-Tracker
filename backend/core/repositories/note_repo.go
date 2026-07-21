package repositories

import (
	"stocks-portfolio-tracker/core/domain"

	"gorm.io/gorm"
)

type NoteRepository interface {
	AddNote(note *domain.Note, trx *gorm.DB) error
	RemoveNote(noteID uint, trx *gorm.DB) error
	UpdateNote(note *domain.Note, trx *gorm.DB) error

	GetNote(noteID uint, tx *gorm.DB) (*domain.Note, error)
	GetNotes(userID uint64) ([]domain.Note, error)
	GetDB() *gorm.DB
}

type noteRepo struct {
	DB *gorm.DB
}

func NewNoteRepo(DB *gorm.DB) NoteRepository {
	return &noteRepo{DB: DB}
}

func (r *noteRepo) AddNote(note *domain.Note, trx *gorm.DB) error {
	db := r.DB
	if trx != nil {
		db = trx
	}

	return db.Create(&note).Error
}

func (r *noteRepo) RemoveNote(noteID uint, trx *gorm.DB) error {
	db := r.DB
	if trx != nil {
		db = trx
	}

	result := db.Unscoped().Delete(&domain.Note{}, noteID)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return domain.ErrItemNotFound
	}

	return nil
}

func (r *noteRepo) UpdateNote(note *domain.Note, trx *gorm.DB) error {
	db := r.DB
	if trx != nil {
		db = trx
	}
	return db.Save(note).Error
}

func (r *noteRepo) GetNotes(userID uint64) ([]domain.Note, error) {
	var notes []domain.Note
	if err := r.DB.Where("user_id = ?", userID).Find(&notes).Error; err != nil {
		return nil, err
	}

	return notes, nil
}

func (r *noteRepo) GetNote(noteID uint, tx *gorm.DB) (*domain.Note, error) {
	db := r.DB

	if tx != nil {
		db = tx
	}
	var notes domain.Note
	if err := db.Where("id = ?", noteID).Take(&notes).Error; err != nil {
		return nil, err
	}

	return &notes, nil
}

func (r *noteRepo) GetDB() *gorm.DB {
	return r.DB
}
