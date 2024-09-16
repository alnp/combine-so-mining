# Stack Mining
Stack Overflow mining results used for the following paper during the 37th Brazilian Symposium on Software Engineering (SBES) for the Track Insightful Ideas and Emerging Results (IIER):
> Reactive Programming with Swift Combine: An Analysis of Problems Faced by Developers on Stack Overflow.

Forked and adapted from the scripts used to the paper [Mining the Usage of Reactive Programming APIs: A Mining Study on GitHub and Stack Overflow](https://github.com/carloszimm/so-mining-msr22)

## Data
Under the folders in `/assets`, data either genereated by or collected for the scripts execution can be found. The table gives a brief description of each folder:

| Folder   | Description         |
| :------------- |:-------------|
| data explorer | Contains posts collected from Stack Exchange Data Explorer |
| lda-results | Contains the results of the last LDA execution |
| result-processing | Contains data presented in the Result section |

The file `stopwords.txt` contains a list of stop words used during preprocessing.

### LDA results
The results for the last LDA (Latent Dirichlet Allocation) are available under `/data-explorer/lda-results/2023-01-03 21-25-53/`. As detailed in the paper, the execution with the following settings generated the most coherent results:
| Parameter     | Value         |
| :------------- |:-------------:|
| Topics         | 14 |
| HyperParameters | &alpha;=&beta;=0.01 |
| Iterations | 1,000 |

Each result is comprised of three CSV files following the bellow file name pattern:
* **_[file name of the posts file]_\_doctopicdist\__[#topics]_\__[analyzed post field]_.csv** - contains the posts' ids and their distribution of topics+proportion, including the dominant topic and its proportion in a separate column for easy retrieval;
* **_[file name of the posts file]_\_topicdist\__[#topics]_\__[analyzed post field]_.csv** - the topic distribution along with their words+proportion descendingly sorted by word proportion;
* **_[file name of the posts file]_\_topicdist\__[#topics]_\__[analyzed post field]_ - topwords.csv** - (extra) the same as the above one but presenting the topics only with their top words (set in [config](#configuration)) to facilitate the open card sorting technique.

Where:
* _[file name of the posts file]_: is a file under `assets/data explorer/consolidated sources` and set through [config](#configuration);
* _[#topics]_: number of topics for that specific execution;
* _[analyzed post field]_: either Title or Body (see [Configuration](#configuration)).

## Execution
### Requirements
Most of the scripts utilize Golang as the main language and they have be executed the following version:
* Go v1.17.5

Before execution of the Golang scripts, the following command must be issued in a terminal (inside the root of the project) to download the dependencies:
```sh
go mod tidy
```

### Scripts
The Go scripts are available under the `/cmd` folder

##### consolidate-sources
Script to unify all the CSV acquired from [Stack Exchange Data Explorer](https://data.stackexchange.com/).
```sh
go run cmd/consolidate-sources/main.go
````
&ensp;:floppy_disk: After execution, the result is available at `assets/data explorer/consolidated sources/`.

##### extract-posts
Script to extract post from a given topic.
```sh
go run cmd/extract-posts/main.go
```
&ensp;:floppy_disk: After execution, the result is available at `assets/extracted-posts`.

##### lda
Script to execute the LDA algorithm.
```sh
go run cmd/lda/main.go
``` 
&ensp;:floppy_disk: After execution, the result is available at `assets/lda-results`.

##### open-sort
Script to generate random posts according to their topics and facilitate the open sort (topic labeling) execution.
```sh
go run cmd/open-sort/main.go
```
&ensp;:floppy_disk: After execution, the result is available at `assets/opensort`.

##### process-results
Script to process results and generate info about the topics, the popularities and difficulties.
```sh
go run cmd/process-results/main.go
```
&ensp;:floppy_disk: After execution, the result is available at `assets/result-processing`.

#### Configuration
The LDA script require the setting of some configuration in a JSON(config.json) under `/configs` folder. This JSON is expecting a array of objects, each one representing a LDA execution. The objective must have the following structure (this is the object present by default in config.json):
```yaml
{
    "fileName": "all_withAnswers",
    "field": "Body",
    "combineTitleBody": true,
    "minTopics": 10,
    "maxTopics": 35,
    "sampleWords": 20
  }
```
Where:
* **fileName(string)**: the name of the file with the posts(at `assets/data explorer/consolidated sources`);
* **field(string)**: the field to considered in LDA (either Title or Body);
* **combineTitleBody(boolean)**: set it to combine title and body and assign the result to the post's Body field (only applicable if `field` is set to `"Body"`);
* **minTopics(integer)**: the minimum quantity of posts to be generated;
* **maxTopics(integer)**: the maximum quantity of posts to be generated;
* **sampleWords(integer)**: the amount of sample *top* words to be included in an extra file with file name ending with ` - topwords`.

#### Stack Exchange Data Explorer
Possible requirements:
* Internet browser
* Node.js (tested with v14.17.5)

We used the same tiny JS script used on Zimmerle's paper to download the Stack Overflow posts (questions with and without accepted answers) related to the Combine framework from [Stack Exchange Data Explorer](https://data.stackexchange.com/) (SEDE).
It's available at `/scripts/data explorer/data-explorer.js`. To execute it, one must:
1. Be logged in SEDE;
2. Place the script in the DevTools's **Console**;
3. Call `executeQuery` passing 3 for Combine as a parameter.

Moreover, there's a second script(`/scripts/data explorer/rename.js`) that can be used to move (and rename) the results to the their proper folder `/assets/data explorer/[library folder]`, so they can be further used by the Go [consolidate-sources](#consolidate-sources) script. In order for this second JS script to work, one must place the results under `/scripts/data explorer/staging area` and call the script in a terminal (with node) and passing 3 (for Combine). For example:
```sh
node rename 3
```
Before execution of node.js script, one must execute the following terminal command within `/scripts/data explorer/`:
```sh
npm install
```
As detailed in the paper, the Stack Overflow tag used:
* *combine* (Combine)

## Other Useful Information
### Stack Overflow Removed Terms
As defined in the preprocessing phase in the paper, some terms commonly found in the Stack Overflow posts were removed from the corpus. Those include:
> `differ`, `specif`, `deal`, `prefer`, `easili`, `easier`, `mind`, `current`, `solv`, `proper`, `modifi`, `explain`, `hope`, `help`, `wonder`, `altern`, `sens`, `entir`, `ps`, `solut`, `achiev`, `approach`, `answer`, `requir`, `lot`, `feel`, `pretti`, `easi`, `goal`, `think`, `complex`, `eleg`, `improv`, `look`, `complic`, `day`, `chang`, `issu`, `add`, `edit`, `remov`, `custom`, `suggest`, `comment`, `ad`, `refer`, `stackblitz`, `link`, `mention`, `detect`, `face`, `fix`, `attach`, `perfect`, `mark`, `reason`, `suppos`, `notic`, `snippet`, `demo`, `line`, `piec`, `appear`

### Topic-Label Mapping
| Topic #      | Label/Name    |
| ------------ |:-------------|
| 0 | Displaying Data From Collections |
| 1 | Operators for Stream Manipulation |
| 2 | ViewModel in SwiftUI |
| 3 | REST API Calls |
| 4 | Data Binding and View Updating |
| 5 | Introductory Combine |
| 6 | Stream Composition |
| 7 | Concurrency |
| 8 | UI and User Interaction |
| 9 | Software Development |
| 10 | Publishing Data |
| 11 | Stream Lifecycle |
| 12 | Data Typing |
| 13 | Bugs and Error Handling |
