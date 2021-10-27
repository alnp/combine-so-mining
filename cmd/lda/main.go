package main

import (
	"log"
	"path/filepath"
	"strconv"
	"sync"

	config "github.com/carloszimm/stack-mining/configs"
	csvUtils "github.com/carloszimm/stack-mining/internal/csv"
	"github.com/carloszimm/stack-mining/internal/lda"
	"github.com/carloszimm/stack-mining/internal/processing"
	"github.com/carloszimm/stack-mining/internal/types"
	"github.com/carloszimm/stack-mining/internal/util"
)

var configs []config.Config

func init() {
	configs = config.ReadConfig()
}

func combineTitleBody(posts []*types.Post) {
	for _, post := range posts {
		if post.PostTypeId == 2 {
			parentPost := types.SearchPost(posts, post.ParentId)
			post.Body = parentPost.Title + " " + post.Body
		} else {
			post.Body = post.Title + " " + post.Body
		}
	}
}

func main() {
	var filesPath string
	removeAllFolders := util.RemoveAllFolders(config.LDA_RESULT_PATH)
	writeFolder := util.WriteFolder(config.LDA_RESULT_PATH)

	for _, cfg := range configs {
		filesPath = filepath.Join(config.CONSOLIDATED_SOURCES_PATH, cfg.FileName+".csv")

		c := make(chan []*types.Post)
		go csvUtils.ReadPostsCSV(filesPath, c)
		posts := <-c

		if cfg.CombineTitleBody {
			combineTitleBody(posts)
		}

		log.Println("Processing:", len(posts), "documents for",
			cfg.FileName+".csv", "using", cfg.Field, "field")

		out := processing.SetupLDAPipeline(posts, cfg.Field)
		corpus := <-out

		log.Println("Preprocessing finished!")
		log.Println("Total words:", util.CountWords(corpus))

		log.Println("Running LDA...")

		if cfg.MinTopics > 0 {
			//clean existing folders
			removeAllFolders(filepath.Join(cfg.FileName, cfg.Field))

			var perplexities []float64

			for i := cfg.MinTopics; i <= cfg.MaxTopics; i++ {
				log.Println("Running for", i, "topics")
				docTopicDist, topicWordDist, perplexity := lda.LDA(i, corpus)

				perplexities = append(perplexities, perplexity)

				//(re)create folders
				writeFolder(filepath.Join(cfg.FileName, cfg.Field, strconv.Itoa(i)))
				var wg sync.WaitGroup
				wg.Add(2)
				go csvUtils.WriteTopicDist(&wg, cfg, i, topicWordDist)
				go csvUtils.WriteDocTopicDist(&wg, cfg, i, posts, docTopicDist)
				wg.Wait()
			}

			csvUtils.WritePerplexities(cfg, perplexities)
		}

		log.Println("LDA finished!")
	}
}
